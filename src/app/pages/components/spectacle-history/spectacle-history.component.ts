// spectacle-history.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonDatetime, IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-spectacle-history',
  templateUrl: './spectacle-history.component.html',
  styleUrls: ['./spectacle-history.component.scss'],
  standalone: false
})
export class SpectacleHistoryComponent implements OnInit {
  @ViewChild('dateTime', { static: false }) dateTime!: IonDatetime;
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
    this.route.paramMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      console.log('Received ID:', this.reference_number);
      if (this.reference_number == "null" || this.reference_number == null) {
        this.openModal();
      } else {
        this.patchData();
      }
    });
  }

  ngOnInit() {
  // 1. Update form initialization defaults in ngOnInit() so hidden controls pass valid defaults
this.spectacleForm = this.fb.group({
  wearSpectacles: [false, Validators.required],
  wearingDuration: ['', Validators.required],
  hasGlasses: [false, Validators.required],
  lensCondition: ['good'], 
  lensMaterial: ['plastic'], 
  lensCoating: ['uncoated'], 
  lensType: [''],
  refractiveIndex: ['1.5'], 
  frameCondition: ['good'],         // Defaulted since Q6 input is hidden
  framesFit: [false],               // Renumbered visible 6.1
  framesBend: [false],              // Renumbered visible 6.2
  framesBroken: [false],            // Defaulted since Q6.3 is hidden
  framesGoodCondition: [true],      // Defaulted since Q6.4 is hidden
  glassesChangeDuration: [''],
  glassesSource: [''],
  selfChosenFrames: [false],
  satisfactionLevel: [''],
});

    // Smart value change listeners to adjust requirements dynamically
    this.spectacleForm.get('wearSpectacles')?.valueChanges.subscribe(wears => {
      if (!wears) {
        this.spectacleForm.get('wearingDuration')?.clearValidators();
      } else {
        this.spectacleForm.get('wearingDuration')?.setValidators([Validators.required]);
      }
      this.spectacleForm.get('wearingDuration')?.updateValueAndValidity();
    });

    this.spectacleForm.get('hasGlasses')?.valueChanges.subscribe(has => {
      if (!has) {
        this.spectacleForm.get('lensType')?.clearValidators();
        this.spectacleForm.get('glassesChangeDuration')?.clearValidators();
      } else {
        this.spectacleForm.get('lensType')?.setValidators([Validators.required]);
      }
      this.spectacleForm.get('lensType')?.updateValueAndValidity();
      this.spectacleForm.get('glassesChangeDuration')?.updateValueAndValidity();
    });
  }

  patchData() {
    if (this.reference_number) {
      this.apiService.getSpectacleHistory(this.reference_number).subscribe(res => {
        if (res && !res.error && res.body) {
          const data = res.body;
      // 2. Ensure patchData() safely handles missing values for hidden controls
this.spectacleForm.patchValue({
  wearSpectacles: data.wears_spectacles,
  wearingDuration: data.wearing_duration,
  hasGlasses: data.has_glasses,
  lensCondition: data.lens_condition || 'good',
  lensMaterial: data.lens_material || 'plastic',
  lensCoating: data.lens_coating || 'uncoated',
  lensType: data.lens_type,
  refractiveIndex: data.refractive_index || '1.5',
  frameCondition: data.frame_condition || 'good',
  framesFit: data.frame_fit,
  framesBend: data.frame_bent,
  framesBroken: data.frame_broken || false,
  framesGoodCondition: data.frame_good_condition || true,
  glassesChangeDuration: data.glasses_change_duration,
  glassesSource: data.glasses_source,
  selfChosenFrames: data.chose_own_frame,
  satisfactionLevel: data.satisfaction_level
});
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
    const wearsSpectacles = this.spectacleForm.get('wearSpectacles')?.value;
    const hasGlasses = this.spectacleForm.get('hasGlasses')?.value;

    if (this.currentStep === 1) {
      if (this.spectacleForm.get('wearSpectacles')?.invalid) {
        this.markFieldsTouched(['wearSpectacles']);
        return;
      }
      if (wearsSpectacles) {
        if (this.spectacleForm.get('wearingDuration')?.invalid) {
          this.markFieldsTouched(['wearingDuration']);
          return;
        }
      } else {
        // If child doesn't wear glasses, submit directly
        this.submitForm();
        return;
      }
    } else if (this.currentStep === 2) {
      if (this.spectacleForm.get('hasGlasses')?.invalid) {
        this.markFieldsTouched(['hasGlasses']);
        return;
      }
      // If child has no glasses with them, skip Steps 3, 4, 5 and go straight to Step 6
      if (!hasGlasses) {
        this.currentStep = 6;
        this.submitted = false;
        return;
      }
    } else if (this.currentStep === 3) {
      if (this.spectacleForm.get('lensType')?.invalid) {
        this.markFieldsTouched(['lensType']);
        return;
      }
    } else if (this.currentStep === 4) {
      // Step 4 frame condition checks
    } else if (this.currentStep === 5) {
      // Step 5 glasses change checks
    }

    this.submitted = false;
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  isGlassesChangeCalendarOpen = false;

  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      console.log('Selected user:', selectedUser);
      this.handleUser(selectedUser);
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }

  handleUser(user: any) {
    console.log('=== Selected User Details ===');
    console.log('User ID:', user.id);
    console.log('Reference Number:', user.reference_number);
    this.participantData = user;
    this.reference_number = user.reference_number;
    this.patchData();
  }

  openGlassesChangeCalendar() {
    this.isGlassesChangeCalendarOpen = true;
  }

  onGlassesChangeSelected(event: any) {
    this.closeGlassesChangeCalendar();
  }

  closeGlassesChangeCalendar() {
    this.isGlassesChangeCalendarOpen = false;
  }

  previousStep() {
    const hasGlasses = this.spectacleForm.get('hasGlasses')?.value;

    if (this.currentStep === 6 && !hasGlasses) {
      // Jump back to Step 2 if glasses are not present
      this.currentStep = 2;
    } else if (this.currentStep > 1) {
      this.currentStep--;
    }
    this.submitted = false;
  }

  submitForm() {
    this.submitted = true;
    
    // Validate key fields depending on active flow
    if (this.spectacleForm.get('wearSpectacles')?.value === true) {
      if (this.spectacleForm.get('hasGlasses')?.value === true && this.spectacleForm.get('lensType')?.invalid) {
        this.apiService.presentToast('Please select the lens type', 'danger');
        return;
      }
    }

    let glassesChangeDuration = this.spectacleForm.value.glassesChangeDuration;

    if (glassesChangeDuration instanceof Date || !isNaN(Date.parse(glassesChangeDuration))) {
      glassesChangeDuration = this.formatDate(glassesChangeDuration);
    }

    this.apiService.isLoading.next(true);
    let payload = {
      reference_number: this.reference_number,
      wears_spectacles: this.spectacleForm.value.wearSpectacles,
      wearing_duration: this.spectacleForm.value.wearingDuration,
      has_glasses: this.spectacleForm.value.hasGlasses,
      lens_condition: this.spectacleForm.value.lensCondition || 'good',
      lens_material: this.spectacleForm.value.lensMaterial || 'plastic',
      lens_coating: this.spectacleForm.value.lensCoating || 'uncoated',
      lens_type: this.spectacleForm.value.lensType,
      refractive_index: this.spectacleForm.value.refractiveIndex || '1.5',
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
    
    this.apiService.SpectacleHistory(payload).subscribe((res: any) => {
      this.apiService.isLoading.next(false);
      if (res.error === false) {
        this.apiService.presentToast(res.message);
        this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
      } else {
        this.apiService.presentToast(res.message, 'danger');
      }
    }, err => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast('Something Went Wrong', 'danger');
    });
  }

  private markFieldsTouched(fields: string[]) {
    fields.forEach(field => {
      this.spectacleForm.get(field)?.markAsTouched();
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  dateChanged(event: any) {
    this.selectedDate = event.detail.value;
    if (this.currentStep === 5) {
      this.spectacleForm.patchValue({ glassesChangeDuration: this.formatDate(this.selectedDate) });
    }
    this.showCalendar = false;
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  onEdit() {
    this.spectacleForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile']);
  }
}