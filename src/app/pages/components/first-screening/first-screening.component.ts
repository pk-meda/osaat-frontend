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
import { StationService } from 'src/app/services/station.service';

@Component( {
  selector: 'app-first-screening',
  templateUrl: './first-screening.component.html',
  styleUrls: [ './first-screening.component.scss' ],
  standalone: false
} )
export class FirstScreeningComponent implements OnInit, OnDestroy {

  screeningForm!: FormGroup;
  currentStep: number = 1;
participantId: number | null = null;
  totalSteps: number = 2;
  submitted = false;

  // Added properties required by HTML template
  isAdult: boolean = false;
  reference_number: string | null = null;

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
    private modal: ModalController,
    private stationService: StationService
  ) {
    // this.openModal()
    // generate age options
    for ( let i = 5; i <= 65; i++ ) {
      this.ages.push( i );
    }
    
  }

  ngOnInit() {
    this.screeningForm = this.fb.group( {
     firstname: ['', Validators.required],
    surname: ['', Validators.required],
    contact_name: [''],
    contact_surname: [''],
    contact_number: [''],
    relationship: [''],
    referral_clinic: [''],
    gender: ['', Validators.required],
    age: [null, Validators.required],
    grade: ['', Validators.required],
    wears_Spectacles: ['', Validators.required],
    reference_number: [''],
      // country: ['', Validators.required],
      // province: ['', Validators.required],
      // School_name: ['', Validators.required],
      // address: ['', Validators.required],
      // contact_person: ['', [Validators.required]],
      // , Validators.pattern(/^\d{10}$/)]
    } );

    // Automatically update isAdult based on participant age
  this.screeningForm.get('age')?.valueChanges.subscribe((age: number | null) => {
    this.isAdult = age ? age >= 18 : false;
  })

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
  // Check validity for Step 1 controls
  isStep1Valid(): boolean {
    const step1Controls = ['firstname', 'surname'];
    return step1Controls.every(name => {
      const control = this.screeningForm.get(name);
      return control && control.valid;
    });
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

async saveParticipantStep1() {
  this.apiService.isLoading.next(true); // Replaces loadingCtrl

  const payload = {
    name: this.screeningForm.value.firstname,
    surname: this.screeningForm.value.surname,
    contact_first_name: this.screeningForm.value.contact_name,
    contact_surname: this.screeningForm.value.contact_surname,
    relationship: this.screeningForm.value.relationship,
    contact_number: this.screeningForm.value.contact_number
  };

  console.group('=== STEP 1: Sending Payload ===');
  console.log('Step 1 Outgoing Payload:', payload);
  console.groupEnd();

  this.apiService.firstScreening(payload).subscribe({ // Call actual method name
    next: (res: any) => {
      this.apiService.isLoading.next(false);
      console.group('=== STEP 1: Backend Response Debug ===');
      console.log('Full Raw Response (res):', res);
      console.log('Response Body (res.body):', res?.body);
      console.log('Primary Key res.body.id:', res?.body?.id);
      console.log('Foreign Key res.body.participant:', res?.body?.participant);
      console.log('Reference Number res.body.reference_number:', res?.body?.reference_number);
      console.groupEnd();
      this.apiService.presentToast('Participant registered successfully!', 'success');
      
      if (res?.body?.reference_number) {
        this.reference_number = res.body.reference_number;
        this.participantId = res.body.participant || res.body.id;
        this.screeningForm.patchValue({ reference_number: this.reference_number });
      }
      console.group('=== STEP 1: Component State Saved ===');
      console.log('Assigned this.participantId:', this.participantId);
      console.log('Assigned this.reference_number:', this.reference_number);
      console.groupEnd();
      
      this.submitted = false;
      this.currentStep = 2;
    },
    error: (err: any) => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast('Failed to save participant details.', 'danger');
      console.error(err);
    }
  });
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

  /*previousStep() {
    if ( this.currentStep > 1 ) {
      this.currentStep--;
      this.submitted = false;
    }
  }
*/
    previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  onAlphabetOnly( event: any ) {
    const val = ( event.target as HTMLInputElement ).value.replace( /[^A-Za-z]/g, '' );
    this.screeningForm.get( 'refPrefix' )!.setValue( val.toUpperCase() );
  }

private buildFormData(): FormData {
  const fd = new FormData();
  const v = this.screeningForm.getRawValue();

  // Helper to safely append only non-empty values
  const safeAppend = (key: string, val: any) => {
    if (val !== null && val !== undefined && val !== '') {
      fd.append(key, val);
    }
  };

  safeAppend('name', v.firstname);                        // Maps 'firstname' -> 'name'
  safeAppend('surname', v.surname);                      // Maps 'surname' -> 'surname'
  safeAppend('contact_first_name', v.contact_name);      // Maps 'contact_name' -> 'contact_first_name'
  safeAppend('contact_surname', v.contact_surname);      // Maps 'contact_surname' -> 'contact_surname'
  safeAppend('contact_number', v.contact_number);
  safeAppend('relationship', v.relationship);
  safeAppend('school', this.schoolData);
  safeAppend('referral_clinic', v.referral_clinic);
  safeAppend('gender', v.gender);
  safeAppend('grade', v.grade);
  safeAppend('wears_spectacles', v.wears_Spectacles);

  // Cast age to string safely
  if (v.age !== null && v.age !== undefined && v.age !== '') {
    fd.append('age', v.age.toString());
  }

  // Identifiers from Step 1
  const refNum = this.reference_number || v.reference_number;
  if (refNum) {
    fd.append('reference_number', refNum);
  }

  if (this.participantId) {
    fd.append('participant', this.participantId.toString());
  }
// --- LOG ALL FORMDATA KEYS & VALUES ---
  console.group('=== STEP 2: FormData Payload Inspection ===');
  console.log('Current this.participantId in class:', this.participantId);
  console.log('Current this.reference_number in class:', this.reference_number);
  console.log('--- FormData Key-Value Pairs Sent to Backend ---');
  fd.forEach((value, key) => {
    console.log(`[FormData] ${key}:`, value);
  });
  console.groupEnd();
  
  return fd;
}

async submitForm() {
  this.submitted = true;

  // 1. STEP 1 VALIDATION LOGIC
  if (this.currentStep === 1) {
    if (!this.isStep1Valid()) {
      this.apiService.presentToast('Please fill all required fields for Step 1.', 'danger');

      console.group('=== Step 1 Validation Errors ===');
      ['firstname', 'surname'].forEach(key => {
        const controlErrors = this.screeningForm.get(key)?.errors;
        if (controlErrors != null) {
          console.log(`Control: ${key} | Status: INVALID | Errors:`, controlErrors);
        }
      });
      console.groupEnd();

      return;
    }
  }

  // 2. STEP 2 / FULL FORM VALIDATION LOGIC
  if (this.currentStep === 2 && this.screeningForm.invalid) {
    this.apiService.presentToast('Please fill all required fields.', 'danger');

    console.group('=== Full Form Validation Errors ===');
    Object.keys(this.screeningForm.controls).forEach(key => {
      const controlErrors = this.screeningForm.get(key)?.errors;
      if (controlErrors != null) {
        console.log(`Control: ${key} | Status: INVALID | Errors:`, controlErrors);
      }
    });
    console.groupEnd();

    return;
  }

  // 3. API SUBMISSION & ROUTER NAVIGATION
  this.apiService.isLoading.next(true);
  const payload = this.buildFormData();
console.group('=== FINAL SUBMIT: Triggering API ===');
  console.log('Current Step:', this.currentStep);
  console.log('Using Request Endpoint:', this.participantId ? 'updateFirstScreening' : 'firstScreening');
  console.groupEnd();
  const request$ = this.participantId 
    ? this.apiService.updateFirstScreening(this.participantId, payload)
    : this.apiService.firstScreening(payload);

  request$.subscribe({
    next: (res: any) => {
      this.apiService.isLoading.next(false);
      console.group('=== FINAL SUBMIT: Response Success ===');
      console.log('Backend Response:', res);
      console.groupEnd();
      if (!res.error) {
        this.apiService.presentToast(
          `Student Registered Successfully! Reference: ${res.body.reference_number}`,
          'success'
        );
        // Redirect directly to the complaint step of the clinical workflow
        this.router.navigate(['/layout/complaint', res.body.reference_number]);
      } else {
        this.apiService.presentToast(res.message, 'danger');
      }
    },
    error: () => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast('Something went wrong', 'danger');
    }
  });
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


async nextStep() {
  this.submitted = true;

  // STEP 1: Validate, save draft, and move to Step 2 UI
  if (this.currentStep === 1) {
    const step1Controls = ['firstname', 'surname', 'contact_number', 'relationship'];
    let isValid = true;

    step1Controls.forEach(control => {
      if (this.screeningForm.get(control)?.invalid) {
        this.screeningForm.get(control)?.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.apiService.presentToast('Please fill in all required participant details.');
      return;
    }

    // Trigger Step 1 API persistence before advancing
    await this.saveParticipantStep1();

    // Advance UI to Step 2 (First Screening)
    this.currentStep = 2;
    this.submitted = false;
    return;
  }

  // STEP 2: Trigger submission (validates, saves API data, and routes to /layout/complaint)
  if (this.currentStep === 2) {
    await this.submitForm();
  }
}

  /*nextStep() {
    // Validate Step 1 fields before proceeding to Step 2
    if (this.currentStep === 1) {
      const step1Fields = ['firstname', 'surname', 'contact_name', 'contact_surname', 'relationship'];
      let isValid = true;

      step1Fields.forEach(field => {
        const control = this.screeningForm.get(field);
        if (control && control.invalid) {
          control.markAsTouched();
          isValid = false;
        }
      });

      if (isValid) {
        this.currentStep = 2;
      }
    }
  }*/




  //nextStep() {
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
  //}

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
