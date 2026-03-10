// src/app/first-screening/first-screening.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/helpers/auth/authentication.service';
import { ApiService } from 'src/app/services/api.service';
import { ModalController } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { SchoolRegisterComponent } from '../../school-register-modal/school-register/school-register.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ExamChoiceModal } from '../../Modal-continue-DV-CE/exam-choice.modal/exam-choice.modal.component';

@Component( {
  selector: 'app-first-screening',
  templateUrl: './first-screening.component.html',
  styleUrls: [ './first-screening.component.scss' ],
  standalone: false
} )
export class FirstScreeningComponent implements OnInit, OnDestroy {

  screeningForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;
  submitted = false;
  ages: number[] = [];
  school: any[] = [];
  countries: any[] = [];
  provinces: any[] = [];
  first_screening_passed = false;
  fileToUpload?: File;
  filteredSchools: any[] = [];
  filteredCountries: any[] = [];
  filteredProvinces: string[] = [];
  schoolSearch = '';
  customAlertOptions = {
    header: 'Select School',
    subHeader: 'Type to search schools',
    translucent: true,
    cssClass: 'custom-alert',
  };
  // search controls
  countrySearchControl = new FormControl( '' );
  provinceSearchControl = new FormControl( '' );
  searchControl = new FormControl( '' );   // for schools
  schoolData: any
  // dropdown toggles
  showCountryDropdown = false;
  showProvinceDropdown = false;
  showDropdown = false;
  subscriptions: any = {
    formSub: undefined,
    referrelSub: undefined
  }
  @Input() form: FormGroup | any;

  /** reactive control for searchbar */
  schools: any;
  SchoolDetails: any | null;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private modal: ModalController
  ) {
    // this.openModal()
    // generate age options
    for ( let i = 5; i <= 65; i++ ) {
      this.ages.push( i );
    }
    
  }

  ngOnInit() {
    this.screeningForm = this.fb.group( {
      referral_clinic: [ '' ],
      gender: [ '', Validators.required ],
      age: [ null, Validators.required ],
      grade: [ '', Validators.required ],
      wears_Spectacles: [ '', Validators.required ],
      reference_number: [ ''],
      // country: ['', Validators.required],
      // province: ['', Validators.required],
      // School_name: ['', Validators.required],
      // address: ['', Validators.required],
      // contact_person: ['', [Validators.required]],
      // , Validators.pattern(/^\d{10}$/)]
    } );

    this.autoSubmitOnFullInput();
    // this.loadCountries();

    // this.countrySearchControl.valueChanges.subscribe(text => {
    //   const t = (text || '').toLowerCase();
    //   this.filteredCountries = this.countries.filter(c =>
    //     c.country.toLowerCase().includes(t)
    //   );
    // });

    // this.provinceSearchControl.valueChanges.subscribe(text => {
    //   const t = (text || '').toLowerCase();
    //   this.filteredProvinces = this.provinces.filter(p =>
    //     p.toLowerCase().includes(t)
    //   );
    // });

    // this.searchControl.valueChanges.subscribe(text => {
    //   const t = (text || '').toLowerCase();
    //   this.filteredSchools = this.school.filter(s =>
    //     s.school_name.toLowerCase().includes(t)
    //   );
    // });
    let SchollName = localStorage.getItem('school_name')
    console.log(SchollName,'checkSchollname')
    this.schoolData = SchollName;
    this.loadSchools();

  }

  async openModal() {
    const modal = await this.modal.create( {
      component: SchoolRegisterComponent,
      componentProps: {
        screeningType: 'School Info',
      }
    } );
    await modal.present();
    const { data } = await modal.onDidDismiss();
    let SchollName = localStorage.getItem('school_name')
    console.log(SchollName,'checkSchollname')
    this.schoolData = SchollName;
    this.loadSchools();
  }

  loadSchools() {
    this.apiService.getSchool().subscribe( ( res: any ) => {
      this.school = res.body.filter( ( item: any ) => this.schoolData === item.school_name )
      // this.filteredSchools = [...this.school];
    });
  }


  private markFieldsTouched( fields: string[] ) {
    fields.forEach( field => {
      this.screeningForm.get( field )?.markAsTouched();
    } );
  }

  autoSubmitOnFullInput() {
    // Detecting changes for Auto-Submittion form, when form is valid.
    this.subscriptions.formSub = this.screeningForm.valueChanges.pipe( debounceTime( 300 ) ).subscribe( () => {
      if ( this.screeningForm.valid ) this.submitForm();
    } );
    const referral_clinic_control: AbstractControl | null = this.screeningForm.get( 'referral_clinic' );
    const validatorsList = [ Validators.minLength( 5 ), Validators.pattern( /^[a-zA-Z\s'-]+$/ ) ];

    // Detecting changes in "referral_clinic" value to set or remove validators
    this.subscriptions.referrelSub = referral_clinic_control?.valueChanges
      .pipe(
        debounceTime( 300 ),
        distinctUntilChanged()
      )
      .subscribe( ( value: string ) => {
        value = value.trim();
        if ( value && referral_clinic_control.errors ) return
        else if ( !value && referral_clinic_control.errors ) {
          referral_clinic_control.removeValidators( validatorsList );
        }
        else if ( value && !referral_clinic_control.errors ) {
          referral_clinic_control.setValidators( validatorsList );
          referral_clinic_control.updateValueAndValidity( { emitEvent: true } );
        }
        referral_clinic_control.setValue( value )
        referral_clinic_control.markAsTouched();
        referral_clinic_control.updateValueAndValidity( { onlySelf: true, emitEvent: false } );
      } )
  }

  previousStep() {
    if ( this.currentStep > 1 ) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  onAlphabetOnly( event: any ) {
    const val = ( event.target as HTMLInputElement ).value.replace( /[^A-Za-z]/g, '' );
    this.screeningForm.get( 'refPrefix' )!.setValue( val.toUpperCase() );
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    const v = this.screeningForm.value;
    fd.append( 'school', this.schoolData );
    fd.append( 'referral_clinic', v.referral_clinic || '' );
    fd.append( 'gender', v.gender );
    fd.append( 'age', v.age.toString() );
    fd.append( 'grade', v.grade );
    fd.append( 'wears_spectacles', v.wears_Spectacles );
    fd.append('reference_number',v.reference_number ? v.reference_number : '') 
    // fd.append('country', v.country);
    // fd.append('province', this.SchoolDetails.province);
    // fd.append('address', this.SchoolDetails.address);
    // fd.append('contact_person', v.contact_person);
    return fd;
  }

  async submitForm() {
    this.submitted = true;
    if ( this.screeningForm.invalid ) {
      this.apiService.presentToast( 'Please fill all required fields or Also fill secound page data on next click', 'danger' );
      return;
    }
    this.apiService.isLoading.next( true );
    const payload = this.buildFormData();

    this.apiService.firstScreening( payload )
      .subscribe( {
        next: res => {
          console.log( res, 'res' )
          this.apiService.isLoading.next( false );
          if ( !res.error ) {
            this.apiService.presentToast( res.message && res.body.reference_number + ' ' +`Here is Your Reference Number`, 'success' );
            this.CheckingRefrencePage( res.body.reference_number );
          } else {
            this.apiService.presentToast( res.message, 'danger' );
          }
        },
        error: () => {
          this.apiService.isLoading.next( false );
          this.apiService.presentToast( 'Something went wrong', 'danger' );
        }
      } );
  }

  async CheckingRefrencePage( reference_number: any ) {
    const modalcheck = await this.modal.create( {
      component: ExamChoiceModal,
      backdropDismiss: false
    } );
    await modalcheck.present();
    const { data } = await modalcheck.onDidDismiss();
    console.log(data, 'data')
    if ( data?.title === 'doETest' ) {
      this.router.navigate( [ '/eye_exam' ], { queryParams: { reference_number: reference_number }, } );
    }
    if ( data.title === "cancel" ) {
      this.backLocation();
      this.modal.dismiss();
    }
    if ( data.title === "SecoundScreen" ) {
      this.modal.dismiss();
    }
    if ( data.title === "doVAChart" ) {
      this.router.navigate( [ '/layout/measurement-visual' ], { queryParams: { reference_number: reference_number }, } );
    }
  }

  backLocation() { this.router.navigate( [ '/layout/profile' ] ); }
  nevigateProfile() { this.apiService.nevigateProfile( '' ); }
  onEdit() {this.screeningForm.enable() }
  onDelete() { this.router.navigate( [ '/layout/profile' ] ); }
  nextStep() {
    // if (this.currentStep == 1 &&
    //   this.screeningForm.get('country')?.invalid ||
    //   this.screeningForm.get('School_name')?.invalid ||
    //   this.screeningForm.get('province')?.invalid ||
    //   // this.screeningForm.get('contact_person')?.invalid ||
    //   this.screeningForm.get('address')?.invalid
    // ) {
    //   this.markFieldsTouched(['country', 'country', 'School_name', 'province', 'address']);
    //   return;
    // }
    // this.submitted = true;
    // if (this.currentStep < this.totalSteps) {
    //   this.currentStep++;
    //   this.submitted = false;
    // }
  }

  ngOnDestroy(): void {
    if ( this.subscriptions.formSub ) this.subscriptions.formSub.unsubscribe()
    if ( this.subscriptions.referrelSub ) this.subscriptions.referrelSub.unsubscribe()
  }


  // loadCountries() {
  //   this.apiService.getCountryJson().subscribe((res: any) => {
  //     this.countries = res;
  //     this.filteredCountries = [...res];
  //   });
  // }

  // onCountrySelect(event: any) {
  //   const sel = this.countries.find(c => c.country === event.detail.value);
  //   if (sel) {
  //     this.provinces = sel.states;
  //     this.filteredProvinces = [...this.provinces];
  //     this.screeningForm.patchValue({ province: '' });
  //   }
  // }
  /** COUNTRY dropdown */
  // toggleCountryDropdown() {
  //   this.showCountryDropdown = !this.showCountryDropdown;
  //   if (this.showCountryDropdown) this.clearCountrySearch();
  // }
  // selectCountry(name: string) {
  //   this.screeningForm.patchValue({ country: name });
  //   this.showCountryDropdown = false;
  //   // load provinces for that country:
  //   this.onCountrySelect({ detail: { value: name } });
  // }
  // clearCountrySearch() {
  //   this.countrySearchControl.setValue('');
  //   this.filteredCountries = [...this.countries];
  // }

  /** PROVINCE dropdown */
  // toggleProvinceDropdown() {
  //   this.showProvinceDropdown = !this.showProvinceDropdown;
  //   if (this.showProvinceDropdown) this.clearProvinceSearch();
  // }
  // selectProvince(name: string) {
  //   this.screeningForm.patchValue({ province: name });
  //   this.showProvinceDropdown = false;
  // }
  // clearProvinceSearch() {
  //   this.provinceSearchControl.setValue('');
  //   this.filteredProvinces = [...this.provinces];
  // }

  /** SCHOOL dropdown (unchanged) */
  // toggleDropdown() {
  //   this.showDropdown = !this.showDropdown;
  //   if (this.showDropdown) this.clearSearch();
  // }
  // selectSchool(name: string) {
  //   this.screeningForm.patchValue({ School_name: name });
  //   this.showDropdown = false;
  // }
  // clearSearch() {
  //   this.searchControl.setValue('');
  //   this.filteredSchools = [...this.school];
  // }
}
