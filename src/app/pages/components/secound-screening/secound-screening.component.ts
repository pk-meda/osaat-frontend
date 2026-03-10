import { Component, OnInit, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/helpers/auth/authentication.service';
import { ApiService } from 'src/app/services/api.service';
import { ModalController } from '@ionic/angular';
import { ExamChoiceModal } from '../../Modal-continue-DV-CE/exam-choice.modal/exam-choice.modal.component';
import * as intlTelInput from 'intl-tel-input';

@Component( {
  selector: 'app-secound-screening',
  templateUrl: './secound-screening.component.html',
  styleUrls: [ './secound-screening.component.scss' ],
  standalone: false,
} )
export class SecoundScreeningComponent implements OnInit, AfterViewInit {
  screeningForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;

  reference_number: string | null = null;
  firstScreenData: any;
  submitted = false;

  ages: number[] = [];
  participantData: any;
  profileRes: any;

  filteredSchools: any[] = [];
  school: any;

  searchControl = new FormControl( '' );
  showDropdown = false;
  iti: any;


  // define your standard relationship options here (used to detect “Other” cases)
  private readonly standardRelationships = new Set<string>( [
    'Father', 'Mother', 'Guardian', 'Sibling', 'Grandparent',
    'Aunt/Uncle', 'Caregiver', 'Friend', 'Self', 'Other'
  ] );
  pariticiPantId: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private auth: AuthenticationService,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {
    const storedData = localStorage.getItem( 'userdata' );
    this.participantData = storedData
      ? JSON.parse( storedData )
      : { id: '', name: '', age: null, grade: '', school: '' };

    for ( let i = 15; i <= 80; i++ ) this.ages.push( i );
  }

  get isAdult(): boolean {
    const age = Number( this.participantData?.age ?? this.profileRes?.age ?? 0 );
    return !!age && age >= 18;
  }

  ngOnInit() {
    // 1) Build the form (include reference_number)
    this.screeningForm = this.fb.group( {
      // Participant
      firstname: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      surname: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],

      // Contact
      contact_name: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      contact_surname: [ '', [ Validators.required, Validators.minLength( 2 ) ] ],
      relationship: [ '', Validators.required ],
      other_relationship: [ { value: '', disabled: true } ],

      // Phone
      contact_number: [ '', [ Validators.required ],
      ],

      // Readonly field (kept enabled so it doesn't appear disabled)
      reference_number: [ { value: '', disabled: false }, Validators.required ],

      // Optional
      School_name: [ '' ],
    } );

    // 2) Relationship "Other" toggle
    this.screeningForm.get( 'relationship' )?.valueChanges.subscribe( ( val ) => {
      const otherCtrl = this.screeningForm.get( 'other_relationship' );
      if ( val === 'Other' ) {
        otherCtrl?.enable( { emitEvent: false } );
        otherCtrl?.setValidators( [ Validators.required, Validators.minLength( 2 ) ] );
      } else {
        otherCtrl?.reset( '', { emitEvent: false } );
        otherCtrl?.clearValidators();
        otherCtrl?.disable( { emitEvent: false } );
      }
      otherCtrl?.updateValueAndValidity( { emitEvent: false } );
    } );

    // 3) Schools list + search
    this.getSchool();
    this.searchControl.valueChanges.subscribe( ( text ) => {
      const searchTerm = ( text || '' ).toLowerCase().trim();
      this.filteredSchools = ( this.school || [] ).filter( ( s: any ) =>
        ( s?.school_name || '' ).toLowerCase().includes( searchTerm )
      );
    });

    // 4) After form exists, react to route params (or open modal)
    this.activateRoute.queryParamMap.subscribe( async ( params ) => {
      const ref = params.get( 'reference_number' );
      if ( ref ) {
        this.setReferenceNumber( ref );
      } else {
        await this.openModal();
      }
    } );

    // 5) Restore saved school
    const savedSchool = localStorage.getItem( 'school_name' );
    if ( savedSchool ) {
      this.screeningForm.patchValue( { School_name: savedSchool } );
    }
  }

  /** One place to set reference number from ANY source (params OR modal) */
  private setReferenceNumber( ref: string ) {
    this.reference_number = ref || '';
    this.screeningForm.patchValue( { reference_number: this.reference_number } );

    this.loadProfile( this.reference_number );
    this.loadSecondScreening( this.reference_number );

    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    const input = document.querySelector<HTMLInputElement>( '#phoneInput' );

    if ( input ) {
      this.iti = intlTelInput( input, {
        initialCountry: 'auto',
        separateDialCode: true,
        nationalMode: false,
        utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.15/build/js/utils.js',
        geoIpLookup: ( callback ) => {
          fetch( 'https://ipapi.co/json' )
            .then( ( res ) => res.json() )
            .then( ( data ) => callback( data.country_code ) )
            .catch( () => callback( 'us' ) );
        },
      } );

      // Listen for changes
      input.addEventListener( 'input', () => this.updatePhoneNumber() );
      input.addEventListener( 'countrychange', () => this.updatePhoneNumber() );
    }
  }

  updatePhoneNumber() {
    if ( this.iti ) {
      const fullNumber = this.iti.getNumber(); // always includes country code
      this.screeningForm.patchValue( { contact_number: fullNumber } );
      this.cdr.detectChanges();
    }
  }

  private loadProfile( ref: string ) {
    const body = { reference_number: ref };
    this.apiService.profile( body ).subscribe( ( res: any ) => {
      // Some APIs return { body: {...} }, some return object directly.
      this.profileRes = res?.body ?? res;
      this.participantData = this.profileRes || { id: '', name: '', age: null, grade: '', school: '' };
    } );
  }

  /** NEW: Prefill from same API using getSecoundScreening */
  private loadSecondScreening( ref: string ) {
    this.apiService.getSeoundScreening( ref ).subscribe( ( res: any ) => {
      const data = res?.body[ 0 ]
      if ( !data ) return;
      this.pariticiPantId = data.id;
      this.CheckingRefrencePage( ref )
      this.screeningForm.disable();
      const mapped = this.mapApiToForm( data );
      this.screeningForm.patchValue( mapped, { emitEvent: false } );
      if (this.iti && mapped.contact_number) {
       this.iti.setNumber(mapped.contact_number); // updates flag + number
     }
      const rel = this.screeningForm.get( 'relationship' )?.value;
      const otherCtrl = this.screeningForm.get( 'other_relationship' );
      if ( rel === 'Other' ) {
        otherCtrl?.enable( { emitEvent: false } );
        otherCtrl?.setValidators( [ Validators.required, Validators.minLength( 2 ) ] );
      } else {
        otherCtrl?.clearValidators();
        otherCtrl?.disable( { emitEvent: false } );
      }
      otherCtrl?.updateValueAndValidity( { emitEvent: false } );
      this.cdr.detectChanges();
    } );
  }

  /** Map backend payload to form fields.
   *  Assumes backend fields like:
   *   name, surname, contact_first_name, contact_surname, contact_number, relationship, school
   */
  private mapApiToForm( api: any ) {
    const apiRelationship: string = ( api?.relationship ?? '' ).trim();

    let relationship = apiRelationship || '';
    let otherRel = '';

    if ( !this.standardRelationships.has( apiRelationship ) && apiRelationship ) {
      relationship = 'Other';
      otherRel = apiRelationship;
    }
    if ( apiRelationship?.toLowerCase() === 'other' && api?.other_relationship ) {
      otherRel = api.other_relationship;
    }
  let phone = api?.contact_number ?? '';
  if (phone) {
    phone = phone.toString().trim();
  }

    return {
      firstname: api?.name ?? '',
      surname: api?.surname ?? '',

      contact_name: api?.contact_first_name ?? '',
      contact_surname: api?.contact_surname ?? '',
      contact_number:phone,

      relationship,
      other_relationship: otherRel,

      reference_number: this.reference_number || '',
      School_name: api?.school ?? this.screeningForm?.value?.School_name ?? '',

    };
  }

  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      if ( selectedUser?.reference_number ) {
        this.setReferenceNumber( selectedUser.reference_number );
      }
    } catch ( error ) {
      console.error( 'Error opening user selection modal:', error );
    }
  }

  // Kept for backwards-compat calls (if something else calls it)
  handleUser( user: any ) {
    if ( user?.reference_number ) {
      this.setReferenceNumber( user.reference_number );
    }
  }

  // ===== Schools helpers =====
  getSchool() {
    this.apiService.getSchool().subscribe( ( res: any ) => {
      this.school = res?.body?.map( ( item: any ) => item ) || res?.body || [];
      this.filteredSchools = [ ...( this.school || [] ) ];
    } );
  }

  loadSchools() {
    this.apiService.getSchool().subscribe( ( res: any ) => {
      this.school = res?.body || [];
      this.filteredSchools = [ ...( this.school || [] ) ];
    } );
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if ( this.showDropdown ) this.clearSearch();
  }

  selectSchool( name: string ) {
    this.screeningForm.patchValue( { School_name: name } );
    this.showDropdown = false;
    localStorage.setItem( 'school_name', name );
  }

  clearSearch() {
    this.searchControl.setValue( '' );
    this.filteredSchools = [ ...( this.school || [] ) ];
  }

  onSchoolChange( event: any ) {
    const schoolName = event?.target?.value;
    if ( schoolName ) this.getfailedStudent( schoolName );
  }

  getfailedStudent( name: any ) {
    this.apiService.getfailedStudent( name ).subscribe( ( res: any ) => {
      // No-op for now; plug in your logic if needed
    } );
  }

  // ===== Navigation & validation =====
  nextStep() {
    this.markAllFieldsTouched();

    const requiredFields = [
      'firstname',
      'surname',
      'contact_name',
      'contact_surname',
      'relationship',
      'contact_number',
    ];

    if ( this.screeningForm.get( 'relationship' )?.value === 'Other' ) {
      requiredFields.push( 'other_relationship' );
    }

    const hasInvalid = requiredFields.some( ( key ) => this.screeningForm.get( key )?.invalid );
    if ( hasInvalid ) {
      this.apiService.presentToast( 'Please fill all required fields correctly', 'danger' );
      return;
    }

    if ( this.currentStep < this.totalSteps ) this.currentStep++;
  }

  private markAllFieldsTouched() {
    Object.keys( this.screeningForm.controls ).forEach( ( key ) => {
      this.screeningForm.get( key )?.markAsTouched();
    } );
  }

  // Sanitize contact number input to only digits (max 10)
  onContactNumberInput( ev: any ) {
    const inputValue = ev?.detail?.value ?? ev?.target?.value ?? '';
    const digitsOnly = String( inputValue ).replace( /\D/g, '' ).slice( 0, 10 );
    if ( digitsOnly !== inputValue ) {
      this.screeningForm.get( 'contact_number' )?.setValue( digitsOnly, { emitEvent: false } );
    }
  }

  previousStep() {
    if ( this.currentStep > 1 ) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  async submitForm() {
    this.submitted = true;
    this.markAllFieldsTouched();

    const relationshipValue = this.screeningForm.get( 'relationship' )?.value;
    if ( relationshipValue === 'Other' ) {
      const otherRelationshipCtrl = this.screeningForm.get( 'other_relationship' );
      otherRelationshipCtrl?.setValidators( [ Validators.required, Validators.minLength( 2 ) ] );
      otherRelationshipCtrl?.updateValueAndValidity();
    }

    if ( this.screeningForm.invalid ) {
      this.apiService.presentToast( 'Please fill all required fields correctly', 'danger' );
      this.logFormErrors();
      return;
    }

    const relationshipToSend =
      relationshipValue === 'Other'
        ? this.screeningForm.value.other_relationship
        : relationshipValue;

    this.apiService.isLoading.next( true );
  
    try {
      const formData = new FormData();

      // Participant
      formData.append( 'name', this.screeningForm.value.firstname );
      formData.append( 'surname', this.screeningForm.value.surname );

      // Contact
      formData.append( 'contact_first_name', this.screeningForm.value.contact_name );
      formData.append( 'contact_surname', this.screeningForm.value.contact_surname );
      formData.append( 'contact_number', this.screeningForm.value.contact_number );
      formData.append( 'relationship', relationshipToSend );
      if(this.pariticiPantId == null || this.pariticiPantId == undefined){
        formData.append( 'old_reference_number', this.reference_number || '' );
      }else{
        formData.append( 'id', this.pariticiPantId || null );
      }

      // System fields
      formData.append( 'reference_number', this.screeningForm.value.reference_number ? this.screeningForm.value.reference_number : this.reference_number || '' );
      // if(this.screeningForm.value.reference_number){
      //     formData.append( 'old_reference_number', this.reference_number || '' );
      // }
      formData.append( 'second_screening', 'true' )

      // Optional
      if ( this.screeningForm.value.School_name ) {
        formData.append( 'school', this.screeningForm.value.School_name );
      }

      // POST to existing endpoint (unchanged)
      this.apiService.seoundScreening( formData ).subscribe(
        async ( res: any ) => {
          this.apiService.isLoading.next( false );
          if ( res?.error === false ) {
            this.firstScreenData = res.body;
            this.apiService.presentToast( res?.message || 'Registration successful' );
            this.router.navigate( [ '/layout/measurement-visual' ], { queryParams: { reference_number: this.screeningForm.value.reference_number }, } );
          } else {
            this.apiService.presentToast( res?.message || 'Registration failed', 'danger' );
          }
          this.modalController.dismiss();
        },
        ( error ) => {
          this.apiService.isLoading.next( false );
          console.error( 'Submission error:', error );
          this.apiService.presentToast( error.error.message, 'danger' );
        }
      );
    } catch ( error ) {
      this.apiService.isLoading.next( false );
      console.error( 'Form submission error:', error );
      this.apiService.presentToast( 'An error occurred during submission', 'danger' );
    }
  }

  private logFormErrors() {
    console.log( 'Form validation errors:' );
    Object.keys( this.screeningForm.controls ).forEach( ( key ) => {
      const control = this.screeningForm.get( key );
      if ( control?.invalid ) {
        console.log( `${ key }:`, control.errors );
      }
    } );
  }

  backLocation() {
    this.router.navigate( [ '/layout/profile' ] );
    this.modalController.dismiss();
  }

  nevigateProfile() {
    if ( this.firstScreenData?.reference_number ) {
      this.apiService.nevigateProfile( this.firstScreenData.reference_number );
    }
  }

  onEdit() {
    this.screeningForm.enable();
  }

  onDelete() {
    this.router.navigate( [ '/layout/profile' ] );
  }

  // Helper to show custom errors if you need in template
  getFieldError( fieldName: string ): string | null {
    const field = this.screeningForm.get( fieldName );
    if ( field?.errors && ( field.touched || this.submitted ) ) {
      if ( field.errors[ 'required' ] ) return `Please enter ${ fieldName.replace( '_', ' ' ) }`;
      if ( field.errors[ 'minlength' ] )
        return `${ fieldName.replace( '_', ' ' ) } must be at least ${ field.errors[ 'minlength' ].requiredLength } characters`;
      if ( field.errors[ 'pattern' ] && fieldName === 'contact_number' )
        return 'Please enter a valid 10-digit number';
    }
    return null;
  }

  async CheckingRefrencePage( reference_number: any ) {
    const modalcheck = await this.modalController.create( {
      component: ExamChoiceModal,
      backdropDismiss: false
    } );
    await modalcheck.present();
    const { data } = await modalcheck.onDidDismiss();
    if ( data?.title === 'doETest' ) {
      this.router.navigate( [ '/eye_exam' ], { queryParams: { reference_number: reference_number }, } );
    }
    if ( data.title === "cancel" ) {
      this.backLocation()
    }
    if ( data.title === "SecoundScreen" ) {
      this.modalController.dismiss();
    }
    if ( data.title === "doVAChart" ) {
      this.router.navigate( [ '/layout/measurement-visual' ], { queryParams: { reference_number: reference_number }, } );
    }
  }
}
