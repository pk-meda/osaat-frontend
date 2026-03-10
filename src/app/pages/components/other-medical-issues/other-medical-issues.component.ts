import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component( {
  selector: 'app-other-medical-issues',
  templateUrl: './other-medical-issues.component.html',
  styleUrls: [ './other-medical-issues.component.scss' ],
  standalone: false
} )
export class OtherMedicalIssuesComponent implements OnInit {
  @ViewChild( 'dateModal', { static: false } ) dateModal!: IonModal;
  otherMedicalForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;
  isSendNotification: any;
  reference_number: any;
  submitted: boolean = false;
  userData: any;
  participantData: any;
  profileRes: any;
  userInformation: any

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {

    this.route.paramMap.subscribe( params => {
      this.reference_number = params.get( 'reference_number' );
      if ( this.reference_number == "null" || this.reference_number == null ) {
        this.openModal()
      }
    } );
    // let body ={
    //   reference_number:this.reference_number
    // }
    // this.apiService.profile(body).subscribe((res:any)=>{
    //   this.profileRes = res;
    //   if (this.profileRes) {
    //     this.participantData = this.profileRes;
    //     console.log(this.participantData)
    //   } else {
    //     this.participantData = {
    //       id: '',
    //       name: '',
    //       age: null,
    //       grade: '',
    //       school: ''
    //     };
    //   }
    // })

  }

  ngOnInit() {
    this.otherMedicalForm = this.fb.group( {
      surgeryTreatment: [ false, Validators.required ],
      comments: [ '' ]
    } );


  }



  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      console.log( 'Selected user:', selectedUser );

      this.handleUser( selectedUser );
    } catch ( error ) {
      console.error( 'Error opening user selection modal:', error );
    }
  }

  handleUser( user: any ) {
    console.log( '=== Selected User Details ===' );
    console.log( 'User ID:', user.id );
    console.log( 'Reference Number:', user.reference_number );
    this.participantData = user;
    this.reference_number = user.reference_number;
    this.apiService.GetOtherMedicalHistory( this.reference_number ).subscribe( res => {
      if ( res && !res.error && res.body ) {
        const data = res.body;
        this.otherMedicalForm.patchValue( {
          surgeryTreatment: data.medical_issue,
          comments: data.comments || ''
        } );
        console.log(this.otherMedicalForm.value.surgeryTreatment)
        this.otherMedicalForm.disable();
      }
    } );
  }

  setSurgeryTreatment( value: any ) {
    this.otherMedicalForm.patchValue( { surgeryTreatment: value } );
  }

  onEdit() {
    this.otherMedicalForm.enable();
  }

  submitForm() {
    this.submitted = true;
    if ( this.otherMedicalForm.invalid ) {
      this.apiService.presentToast( 'Please fill all fields', 'danger' );
      this.otherMedicalForm.markAllAsTouched();
      return;
    }
    this.apiService.isLoading.next( true );
    let Payload = {
      reference_number: this.reference_number,
      medical_issue: this.otherMedicalForm.value.surgeryTreatment,
      other_medical_issues: true
    };
    this.apiService.OtherMedicalHistory( Payload ).subscribe( ( res: any ) => {
      this.apiService.isLoading.next( false );
      if ( res.error === false ) {
        this.apiService.presentToast( res.message );
        this.router.navigate( [ '/layout/profile' ], { queryParams: { reference_number: this.reference_number } } );
      } else {
        this.apiService.presentToast( res.message, 'danger' );
      }
    }, err => {
      this.apiService.isLoading.next( false );
      this.apiService.presentToast( 'Something Went Wrong', 'danger' );
    } );

    console.log( "Form submitted successfully", Payload );
  }

  nextStep() {
    if ( this.currentStep < this.totalSteps ) {
      this.currentStep++;
    }
  }

  previousStep() {
    if ( this.currentStep > 1 ) {
      this.currentStep--;
    }
  }

  nevigateProfile() {
    this.apiService.nevigateProfile( this.reference_number );
  }

  sendnotification( value: boolean ) {
    this.isSendNotification = value;
  }

  openDatePicker() {
    this.dateModal.present();
  }

  closeDatePicker() {
    this.dateModal.dismiss();
  }

  backLocation() {
    this.router.navigate( [ '/layout/profile' ], { queryParams: { reference_number: this.reference_number } } );

  }
  onDelete() {
    this.router.navigate( [ '/layout/profile' ], { queryParams: { reference_number: this.reference_number } } );

  }
}
