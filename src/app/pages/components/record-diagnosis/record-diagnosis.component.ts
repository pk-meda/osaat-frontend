import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

interface Option { label: string; value: string; }

@Component({
  selector: 'app-record-diagnosis',
  templateUrl: './record-diagnosis.component.html',
  styleUrls: ['./record-diagnosis.component.scss'],
  standalone: false
})
export class RecordDiagnosisComponent implements OnInit {
  dispenseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  submitted = false;

  reference_number: string | null = null;
  participantData: any;
  profileRes: any;

  // ====== Spreadsheet options ======
  readonly REFRACTIVE_ERROR_OPTIONS: Option[] = [
    { label: 'Emmetropia',               value: 'EMMETROPIA' },
    { label: 'Myopia',                   value: 'MYOPIA' },
    { label: 'Hyperopia',                value: 'HYPEROPIA' },
    { label: 'Astigmatism',              value: 'ASTIGMATISM' },
    { label: 'Myopia with astigmatism',  value: 'MYOPIA_WITH_ASTIGMATISM' },
    { label: 'Hyperopia with astigmatism', value: 'HYPEROPIA_WITH_ASTIGMATISM' },
  ];

  readonly AFFECTED_EYE_OPTIONS: Option[] = [
    { label: 'RE',   value: 'RE' },
    { label: 'LE',   value: 'LE' },
    { label: 'Both', value: 'BOTH' },
  ];

  readonly OCULAR_CONDITION_OPTIONS: Option[] = [
    { label: 'Cataract',              value: 'CATARACT' },
    { label: 'Pseudophakia',          value: 'PSEUDOPHAKIA' },
    { label: 'Pterygium',             value: 'PTERYGIUM' },
    { label: 'Ptosis',                value: 'PTOSIS' },
    { label: 'Squint',                value: 'SQUINT' },
    { label: 'Amblyopia',             value: 'AMBLYOPIA' },
    { label: 'Bitot spots',           value: 'BITOT_SPOTS' },
    { label: 'Conjunctivitis',        value: 'CONJUNCTIVITIS' },
    { label: 'Impaired colour vision',value: 'IMPAIRED_COLOUR_VISION' },
    { label: 'None',value: 'none' },
    // "Other" handled in template, do not add here to keep values clean
  ];

  readonly MANAGEMENT_OPTIONS: Option[] = [
    { label: 'No treatment required',              value: 'NO_TREATMENT_REQUIRED' },
    { label: 'Continue using existing spectacles', value: 'CONTINUE_EXISTING_SPECTACLES' },
    { label: 'New spectacles prescribed',          value: 'NEW_SPECTACLES_PRESCRIBED' },
    { label: 'Medicines prescribed',               value: 'MEDICINES_PRESCRIBED' },
    { label: 'Referred for cycloplegic refraction',value: 'REFERRED_CYCLOPLEGIC_REFRACTION' },
    { label: 'Referred to ophthalmologist',        value: 'REFERRED_OPHTHALMOLOGIST' },
    { label: 'Referred for general medical opinion',value: 'REFERRED_GENERAL_MEDICAL_OPINION' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      if (this.reference_number === null) {
        this.openModal();
      }
    });

    // const body = { reference_number: this.reference_number };
    // this.apiService.profile(body).subscribe((res: any) => {
    //   this.profileRes = res;
    //   this.participantData = this.profileRes || { id: '', name: '', age: null, grade: '', school: '' };
    // });
  }

  ngOnInit() {
    this.dispenseForm = this.fb.group({
      refractiveErrorType: ['', Validators.required], // Q1
      affectedEye: ['', Validators.required],         // Q2
      ocularCondition: ['', Validators.required],     // Q3
      ocularConditionOther: [''],                     // Q3 (conditional)
      managementPlan: [[], Validators.required],      // Q4
    });

    // Add/Remove "Other" validator dynamically
    this.dispenseForm.get('ocularCondition')!.valueChanges.subscribe(val => {
      const otherCtrl = this.dispenseForm.get('ocularConditionOther')!;
      if (val === 'OTHER') {
        otherCtrl.setValidators([Validators.required, Validators.minLength(2)]);
      } else {
        otherCtrl.clearValidators();
        otherCtrl.setValue('');
      }
      otherCtrl.updateValueAndValidity({ emitEvent: false });
    });


    if(this.reference_number){
      this.apiService.getDiagnosis(this.reference_number).subscribe((res:any)=>{
        // this.dispenseForm.patchValue({
        // refractiveErrorType: res.
        // affectedEye: 
        // ocularCondition: 
        // ocularConditionOther: 
        // managementPlan:
        // })
      })
    }
  }

  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      this.handleUser(selectedUser);
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }
getManagementLabel(value: string): string {
  const option = this.MANAGEMENT_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
}
removeManagementOption(valueToRemove: string): void {
  if (this.dispenseForm.disabled) {
    return; // Don't allow removal if form is disabled
  }
  
  
  const currentValues = this.dispenseForm.get('managementPlan')?.value || [];
  const updatedValues = currentValues.filter((val: string) => val !== valueToRemove);
  this.dispenseForm.patchValue({ managementPlan: updatedValues });
}
getSelectedManagementCount(): number {
  const values = this.dispenseForm.get('managementPlan')?.value;
  return Array.isArray(values) ? values.length : 0;
}
  handleUser(user: any) {
    this.reference_number = user?.reference_number ?? null;
    this.participantData = user
    if(this.reference_number){
        this.apiService.getDiagnosis(this.reference_number).subscribe((res:any)=>{
             const managementPlan = Array.isArray(res.body.management_plan) 
        ? res.body.management_plan 
        : [res.body.management_plan];
          this.dispenseForm.patchValue({
            refractiveErrorType: res.body.refractive_error_type,
        affectedEye: res.body.affected_eye,
        ocularCondition: res.body.ocular_condition,
        ocularConditionOther: '',
        managementPlan:managementPlan
      })
      if(res){
        this.dispenseForm.disable();
      }
      })
    }
  }

  nextStep() {
    this.submitted = true;

    // Validate only the control(s) on the current step
    const controlsByStep: Record<number, string[]> = {
      1: ['refractiveErrorType'],
      2: ['affectedEye'],
      3: ['ocularCondition', ...(this.dispenseForm.get('ocularCondition')?.value === 'OTHER' ? ['ocularConditionOther'] : [])],
      4: ['managementPlan'],
    };

    const names = controlsByStep[this.currentStep] || [];
    const invalid = names.some(n => this.dispenseForm.get(n)?.invalid);

    names.forEach(n => this.dispenseForm.get(n)?.markAsTouched());

    if (invalid) return;

    this.submitted = false;
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  submitForm() {
    this.submitted = true;
    if (this.dispenseForm.invalid) {
      this.apiService.presentToast('Please answer all required questions.', 'danger');
      return;
    }

    const v = this.dispenseForm.value;
    const payload = {
      reference_number: this.reference_number,
      refractive_error_type: v.refractiveErrorType,
      affected_eye: v.affectedEye,
      ocular_condition: v.ocularCondition === 'OTHER' ? v.ocularConditionOther : v.ocularCondition,
      management_plan: Array.isArray(v.managementPlan) ? v.managementPlan : [v.managementPlan],
      diagnosis_management: true, // keep for backend compatibility if you already use this flag
    };

    this.apiService.isLoading.next(true);
    this.apiService.Diagnosis(payload).subscribe({
      next: (res: any) => {
        this.apiService.isLoading.next(false);
        if (res?.error === false) {
          this.apiService.presentToast(res.message || 'Saved');
          this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number || '' } });
        } else {
          this.apiService.presentToast(res?.message || 'Failed to save', 'danger');
        }
      },
      error: () => {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast('Something went wrong', 'danger');
      }
    });
  }

  onEdit() {
    this.dispenseForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }
}
