// spectacle-history.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonDatetime, IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component( {
  selector: 'app-spectacle-history',
  templateUrl: './spectacle-history.component.html',
  styleUrls: [ './spectacle-history.component.scss' ],
  standalone: false
} )
export class SpectacleHistoryComponent implements OnInit {
  @ViewChild( 'dateTime', { static: false } ) dateTime!: IonDatetime;
  spectacleForm!: FormGroup;
  currentStep = 1;
  totalSteps = 6;
  submitted: boolean = false;
  reference_number: any;
  showCalendar: boolean = false;
  selectedDate: any;
  modal: boolean = false;
  participantData: any;
  profileRes: any;

  // New properties for duration handling
  wearingDurationType: 'months' | 'years' = 'months';
  wearingDurationValue: number | null = null;
   glassesChangeDurationType: 'months' | 'years' = 'months';
  glassesChangeDurationValue: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {
    this.route.paramMap.subscribe( params => {
      this.reference_number = params.get( 'reference_number' );
      console.log( 'Received ID:', this.reference_number );
      if ( this.reference_number == "null" || this.reference_number == null ) {
        this.openModal();
      } else {
       this.patchData()
      }
    } );
  }

  ngOnInit() {
    this.spectacleForm = this.fb.group( {
      wearSpectacles: [ false, Validators.required ],
      wearingDuration: [ '', Validators.required ], // This will now store the formatted duration string
      hasGlasses: [ false, Validators.required ],
      lensCondition: [ '' ],
      lensMaterial: [ '',],
      lensCoating: [ '', ],
      lensType: [ '', ],
      refractiveIndex: [ '', ],
      frameCondition: [ '', ],
      framesFit: [ false, Validators.required ],
      framesBend: [ false, Validators.required ],
      framesBroken: [ false, Validators.required ],
      framesGoodCondition: [ false, Validators.required ],
      glassesChangeDuration: [ '', Validators.required ],
      glassesSource: [ '', ],
      selfChosenFrames: [ false, Validators.required ],
      satisfactionLevel: [ '' ],
    } );
  }

  patchData() {
    if ( this.reference_number ) {
      this.apiService.getSpectacleHistory( this.reference_number ).subscribe( res => {
        if ( res && !res.error && res.body ) {
          const data = res.body;
          this.spectacleForm.patchValue( {
            wearSpectacles: data.wears_spectacles,
            wearingDuration: data.wearing_duration,
            hasGlasses: data.has_glasses,
            lensCondition: data.lens_condition,
            lensMaterial: data.lens_material,
            lensCoating: data.lens_coating,
            lensType: data.lens_type,
            refractiveIndex: data.refractive_index,
            frameCondition: data.frame_condition,
            framesFit: data.frame_fit,
            framesBend: data.frame_bent,
            framesBroken: data.frame_broken,
            framesGoodCondition: data.frame_good_condition,
            glassesChangeDuration: data.glasses_change_duration,
            glassesSource: data.glasses_source,
            selfChosenFrames: data.chose_own_frame,
            satisfactionLevel: data.satisfaction_level
          } );
          this.spectacleForm.disable();
        }
      });
    }
  }

 // Handlers for Q2
 setWearingDurationType(type: 'months' | 'years') {
   this.wearingDurationType = type;
   this.wearingDurationValue = null;
   this.updateDurationForm('wearingDuration', this.wearingDurationValue, this.wearingDurationType);
 }

 setWearingDurationValue(value: number) {
   this.wearingDurationValue = value;
   this.updateDurationForm('wearingDuration', this.wearingDurationValue, this.wearingDurationType);
 }

 // Handlers for Q7
 setGlassesChangeDurationType(type: 'months' | 'years') {
   this.glassesChangeDurationType = type;
   this.glassesChangeDurationValue = null;
   this.updateDurationForm('glassesChangeDuration', this.glassesChangeDurationValue, this.glassesChangeDurationType);
 }

 setGlassesChangeDurationValue(value: number) {
   this.glassesChangeDurationValue = value;
   this.updateDurationForm('glassesChangeDuration', this.glassesChangeDurationValue, this.glassesChangeDurationType);
 }

 private updateDurationForm(ctrl: 'wearingDuration' | 'glassesChangeDuration', val: number | null, type: 'months' | 'years') {
   if (val != null && type) {
     this.spectacleForm.patchValue({ [ctrl]: `${val} ${type}` });
   }
 }

  nextStep() {
    this.submitted = true;
    if ( this.currentStep === 1 ) {
      if (
        this.spectacleForm.get( 'wearSpectacles' )?.invalid ||
        this.spectacleForm.get( 'wearingDuration' )?.invalid
      ) {
        this.markFieldsTouched( [ 'wearSpectacles', 'wearingDuration' ] );
        return;
      }
    } else if ( this.currentStep === 2 ) {
    } else if ( this.currentStep === 3 ) {
      if (
        this.spectacleForm.get( 'lensMaterial' )?.invalid ||
        this.spectacleForm.get( 'lensCoating' )?.invalid ||
        this.spectacleForm.get( 'lensType' )?.invalid ||
        this.spectacleForm.get( 'refractiveIndex' )?.invalid
      ) {
        this.markFieldsTouched( [ 'lensMaterial', 'lensCoating', 'lensType', 'refractiveIndex' ] );
        return;
      }
    } else if ( this.currentStep === 4 ) {
      if (
        this.spectacleForm.get( 'frameCondition' )?.invalid ||
        this.spectacleForm.get( 'framesFit' )?.invalid ||
        this.spectacleForm.get( 'framesBend' )?.invalid ||
        this.spectacleForm.get( 'framesBroken' )?.invalid ||
        this.spectacleForm.get( 'framesGoodCondition' )?.invalid
      ) {
        this.markFieldsTouched( [ 'frameCondition', 'framesFit', 'framesBend', 'framesBroken', 'framesGoodCondition' ] );
        return;
      }
    } else if ( this.currentStep === 5 ) {
      // if ( this.spectacleForm.get( 'glassesChangeDuration' )?.invalid ) {
      //   this.markFieldsTouched( [ 'glassesChangeDuration' ] );
      //   return;
      // }
    }
    this.submitted = false;
    if ( this.currentStep < this.totalSteps ) {
      this.currentStep++;
    }
  }

  isGlassesChangeCalendarOpen = false;

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
    this.patchData()
  }

  openGlassesChangeCalendar() {
    this.isGlassesChangeCalendarOpen = true;
  }

  onGlassesChangeSelected( event: any ) {
    this.closeGlassesChangeCalendar();
  }

  closeGlassesChangeCalendar() {
    this.isGlassesChangeCalendarOpen = false;
  }

  previousStep() {
    if ( this.currentStep > 1 ) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  submitForm() {
    this.submitted = true;
    if ( this.spectacleForm.invalid ) {
      this.markFieldsTouched( Object.keys( this.spectacleForm.controls ) );
      this.apiService.presentToast( 'Please fill all fields', 'danger' );
      return;
    }
      let glassesChangeDuration = this.spectacleForm.value.glassesChangeDuration;

  // Handle date vs. duration safely
  if (glassesChangeDuration instanceof Date || !isNaN(Date.parse(glassesChangeDuration))) {
    glassesChangeDuration = this.formatDate(glassesChangeDuration);
  }

    this.apiService.isLoading.next( true );
    let payload = {
      reference_number: this.reference_number,
      wears_spectacles: this.spectacleForm.value.wearSpectacles,
      wearing_duration: this.spectacleForm.value.wearingDuration,
      has_glasses: this.spectacleForm.value.hasGlasses,
      lens_condition: this.spectacleForm.value.lensCondition,
      lens_material: this.spectacleForm.value.lensMaterial,
      lens_coating: this.spectacleForm.value.lensCoating,
      lens_type: this.spectacleForm.value.lensType,
      refractive_index: this.spectacleForm.value.refractiveIndex,
      frame_condition: this.spectacleForm.value.frameCondition,
      frame_fit: this.spectacleForm.value.framesFit,
      frame_bent: this.spectacleForm.value.framesBend,
      frame_broken: this.spectacleForm.value.framesBroken,
      frame_good_condition: this.spectacleForm.value.framesGoodCondition,
      glasses_change_duration: glassesChangeDuration,
      glasses_source: this.spectacleForm.value.glassesSource,
      chose_own_frame: this.spectacleForm.value.selfChosenFrames,
      satisfaction_level: this.spectacleForm.value.satisfactionLevel,
      spectacle_wearing_history: true
    };
    this.apiService.SpectacleHistory( payload ).subscribe( ( res: any ) => {
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
  }

  private markFieldsTouched( fields: string[] ) {
    fields.forEach( field => {
      this.spectacleForm.get( field )?.markAsTouched();
    } );
  }

  formatDate( date: string | Date ): string {
    return new Date( date ).toISOString().split( 'T' )[ 0 ];
  }

  // Keep existing calendar methods for Question 7 (glasses change date)
  dateChanged( event: any ) {
    this.selectedDate = event.detail.value;
    if ( this.currentStep === 5 ) {
      this.spectacleForm.patchValue( { glassesChangeDuration: this.formatDate( this.selectedDate ) } );
    }
    this.showCalendar = false;
  }

  nevigateProfile() {
    this.apiService.nevigateProfile( this.reference_number );
  }

  backLocation() {
    this.router.navigate( [ '/layout/profile' ], { queryParams: { reference_number: this.reference_number } } );
  }

  onEdit() {
    this.spectacleForm.enable();
  }

  onDelete() {
    this.router.navigate( [ '/layout/profile' ] );
  }
}