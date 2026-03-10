import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonDatetime, IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-current-medical-treatment',
  templateUrl: './current-medical-treatment.component.html',
  styleUrls: ['./current-medical-treatment.component.scss'],
  standalone: false
})
export class CurrentMedicalTreatmentComponent implements OnInit {
  isCalendarOpen = false;
  @ViewChild('dateTime', { static: false }) dateTime!: IonDatetime;
  dispenseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 2;
  submitted: boolean = false;
  isSendNotification: any;
  reference_number: any;
  searchTerm: string = '';
  showCalendar: boolean = false;
  selectedDate: any;
  participantData: any;
  profileRes: any;
  wearingDurationType: 'months' | 'years' = 'months';
  wearingDurationValue: number | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.paramMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      console.log('Received ID:', this.reference_number);
      if (this.reference_number == "null" || this.reference_number == null) {
        this.openModal()
      }
    });
  }

  ngOnInit() {
    this.dispenseForm = this.fb.group({
      currentTreatment: [null, Validators.required],
      medicineUsed: [''],
      eyeTreated: [null],
      medicineType: [null],
      frequency: [null],
      prescribedDate: [null]
    });

    // Listen to changes in currentTreatment to update validators
    this.dispenseForm.get('currentTreatment')?.valueChanges.subscribe(value => {
      this.updateValidators(value);
    });
  }

  updateValidators(hasTreatment: boolean) {
    const medicineUsed = this.dispenseForm.get('medicineUsed');
    const eyeTreated = this.dispenseForm.get('eyeTreated');
    const medicineType = this.dispenseForm.get('medicineType');
    const frequency = this.dispenseForm.get('frequency');
    const prescribedDate = this.dispenseForm.get('prescribedDate');

    if (hasTreatment) {
      // Add validators when treatment is Yes
      medicineUsed?.setValidators([Validators.required]);
      eyeTreated?.setValidators([Validators.required]);
      medicineType?.setValidators([Validators.required]);
      frequency?.setValidators([Validators.required]);
      prescribedDate?.setValidators([Validators.required]);
    } else {
      // Remove validators when treatment is No
      medicineUsed?.clearValidators();
      eyeTreated?.clearValidators();
      medicineType?.clearValidators();
      frequency?.clearValidators();
      prescribedDate?.clearValidators();
      
      // Clear the values
      medicineUsed?.setValue('');
      eyeTreated?.setValue(null);
      medicineType?.setValue(null);
      frequency?.setValue(null);
      prescribedDate?.setValue(null);
    }

    // Update validity
    medicineUsed?.updateValueAndValidity();
    eyeTreated?.updateValueAndValidity();
    medicineType?.updateValueAndValidity();
    frequency?.updateValueAndValidity();
    prescribedDate?.updateValueAndValidity();
  }

  selectCurrentTreatment(value: any) {
    this.dispenseForm.patchValue({ currentTreatment: value });
  }

  onSearch() {
    console.log('Searching for:', this.searchTerm);
  }

  nextStep() {
    this.submitted = true;
    
    if (this.currentStep === 1) {
      // Check if currentTreatment is selected
      if (this.dispenseForm.controls['currentTreatment'].invalid) {
        this.dispenseForm.controls['currentTreatment'].markAsTouched();
        this.apiService.presentToast('Please select an option', 'danger');
        return;
      }
      
      // If Yes is selected, validate medicineUsed
      if (this.dispenseForm.controls['medicineUsed'].invalid) {
        this.dispenseForm.controls['medicineUsed'].markAsTouched();
        return;
      }
    }
    
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.submitted = false;
    }
  }

  submitNoTreatment() {
          this.router.navigate(['/layout/profile']);
  }

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
    
    this.apiService.Get_Current_Medical(this.reference_number).subscribe(res => {
      if (res && !res.error && res.body) {
        const data = res.body;
        this.dispenseForm.patchValue({
          currentTreatment: Boolean(data.medical_treatment),
          medicineUsed: data.medicine,
          eyeTreated: data.treatment_eye,
          medicineType: data.medicine_type,
          frequency: String(data.times_per_day),
          prescribedDate: data.prescribed_date
        });
        this.dispenseForm.disable();
      }
    });
  }

  setWearingDurationType(type: 'months' | 'years') {
    this.wearingDurationType = type;
    this.wearingDurationValue = null;
    this.updateDurationForm('prescribedDate', this.wearingDurationValue, this.wearingDurationType);
  }

  setWearingDurationValue(value: number) {
    this.wearingDurationValue = value;
    this.updateDurationForm('prescribedDate', this.wearingDurationValue, this.wearingDurationType);
  }

  private updateDurationForm(ctrl: 'prescribedDate', val: number | null, type: 'months' | 'years') {
    if (val != null && type) {
      this.dispenseForm.patchValue({ [ctrl]: `${val} ${type}` });
    }
  }

  openCalendar() {
    this.isCalendarOpen = !this.isCalendarOpen;
  }

  onDateSelected(event: any) {
    this.closeCalendar();
  }

  closeCalendar() {
    this.isCalendarOpen = false;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  submitForm() {
    if ( this.dispenseForm.value.currentTreatment == false ) {
      this.submitNoTreatment();
      return;
    }

    this.submitted = true;
    
    // Validate all fields on Step 2
    if (
      this.dispenseForm.controls['eyeTreated'].invalid ||
      this.dispenseForm.controls['medicineType'].invalid ||
      this.dispenseForm.controls['frequency'].invalid ||
      this.dispenseForm.controls['prescribedDate'].invalid
    ) {
      this.dispenseForm.controls['eyeTreated'].markAsTouched();
      this.dispenseForm.controls['medicineType'].markAsTouched();
      this.dispenseForm.controls['frequency'].markAsTouched();
      this.dispenseForm.controls['prescribedDate'].markAsTouched();
      this.apiService.presentToast('Please fill all fields', 'danger');
      return;
    }
    
    this.apiService.isLoading.next(true);

    const Payload = {
      reference_number: this.reference_number,
      medical_treatment: true,
      medicine: this.dispenseForm.value.medicineUsed,
      treatment_eye: this.dispenseForm.value.eyeTreated,
      medicine_type: this.dispenseForm.value.medicineType,
      times_per_day: this.dispenseForm.value.frequency,
      prescribed_date: this.dispenseForm.value.prescribedDate,
      current_medical_treatment: true
    };

    this.apiService.Current_Medical(Payload).subscribe((res: any) => {
      if (res.error === false) {
        this.apiService.presentToast(res.message);
        this.apiService.isLoading.next(false);
        this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
      } else {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast(res.message, 'danger');
      }
    }, err => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast('Something Went Wrong', 'danger');
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  dateChanged(event: any) {
    this.selectedDate = event.detail.value;
    this.dispenseForm.patchValue({ prescribedDate: this.selectedDate });
    this.showCalendar = false;
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  onEdit() {
    this.dispenseForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }
}