import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-refraction',
  templateUrl: './refraction.component.html',
  styleUrls: ['./refraction.component.scss'],
  standalone: false
})
export class RefractionComponent implements OnInit {
  refravtionForm!: FormGroup;
  currentStep = 1;
  totalSteps = 10;
  submitted: boolean = false;
  isSendNotification!: boolean;
  reference_number: any;
  participantData: any;
  profileRes: any;

  // Dropdown options arrays
  sphereOptions = [
    { "value": "-0.25", "label": "-0.25" },
    { "value": "-0.50", "label": "-0.50" },
    { "value": "-0.75", "label": "-0.75" },
    { "value": "-1.00", "label": "-1.00" },
    { "value": "-1.25", "label": "-1.25" },
    { "value": "-1.50", "label": "-1.50" },
    { "value": "-1.75", "label": "-1.75" },
    { "value": "-2.00", "label": "-2.00" },
    { "value": "-2.25", "label": "-2.25" },
    { "value": "-2.50", "label": "-2.50" },
    { "value": "-2.75", "label": "-2.75" },
    { "value": "-3.00", "label": "-3.00" },
    { "value": "-3.25", "label": "-3.25" },
    { "value": "-3.50", "label": "-3.50" },
    { "value": "-3.75", "label": "-3.75" },
    { "value": "-4.00", "label": "-4.00" },
    { "value": "-4.25", "label": "-4.25" },
    { "value": "-4.50", "label": "-4.50" },
    { "value": "-4.75", "label": "-4.75" },
    { "value": "-5.00", "label": "-5.00" },
    { "value": "-5.25", "label": "-5.25" },
    { "value": "-5.50", "label": "-5.50" },
    { "value": "-5.75", "label": "-5.75" },
    { "value": "-6.00", "label": "-6.00" },
    { "value": "-6.50", "label": "-6.50" },
    { "value": "-7.00", "label": "-7.00" },
    { "value": "-7.50", "label": "-7.50" },
    { "value": "-8.00", "label": "-8.00" },
    { "value": "-8.50", "label": "-8.50" },
    { "value": "-9.00", "label": "-9.00" },
    { "value": "-9.50", "label": "-9.50" },
    { "value": "-10.00", "label": "-10.00" },
    { "value": "-10.50", "label": "-10.50" },
    { "value": "-11.00", "label": "-11.00" },
    { "value": "-11.50", "label": "-11.50" },
    { "value": "-12.00", "label": "-12.00" },
    { "value": "-12.50", "label": "-12.50" },
    { "value": "-13.00", "label": "-13.00" },
    { "value": "-13.50", "label": "-13.50" },
    { "value": "-14.00", "label": "-14.00" },
    { "value": "-14.50", "label": "-14.50" },
    { "value": "-15.00", "label": "-15.00" },
    { "value": "-15.50", "label": "-15.50" },
    { "value": "-16.00", "label": "-16.00" },
    { "value": "-16.50", "label": "-16.50" },
    { "value": "-17.00", "label": "-17.00" },
    { "value": "-17.50", "label": "-17.50" },
    { "value": "-18.00", "label": "-18.00" },
    { "value": "-18.50", "label": "-18.50" },
    { "value": "-19.00", "label": "-19.00" },
    { "value": "-19.50", "label": "-19.50" },
    { "value": "-20.00", "label": "-20.00" },
    { "value": "0.00", "label": "0.00" },
    { "value": "+0.25", "label": "+0.25" },
    { "value": "+0.50", "label": "+0.50" },
    { "value": "+0.75", "label": "+0.75" },
    { "value": "+1.00", "label": "+1.00" },
    { "value": "+1.25", "label": "+1.25" },
    { "value": "+1.50", "label": "+1.50" },
    { "value": "+1.75", "label": "+1.75" },
    { "value": "+2.00", "label": "+2.00" },
    { "value": "+2.25", "label": "+2.25" },
    { "value": "+2.50", "label": "+2.50" },
    { "value": "+2.75", "label": "+2.75" },
    { "value": "+3.00", "label": "+3.00" },
    { "value": "+3.25", "label": "+3.25" },
    { "value": "+3.50", "label": "+3.50" },
    { "value": "+3.75", "label": "+3.75" },
    { "value": "+4.00", "label": "+4.00" },
    { "value": "+4.25", "label": "+4.25" },
    { "value": "+4.50", "label": "+4.50" },
    { "value": "+4.75", "label": "+4.75" },
    { "value": "+5.00", "label": "+5.00" },
    { "value": "+5.25", "label": "+5.25" },
    { "value": "+5.50", "label": "+5.50" },
    { "value": "+5.75", "label": "+5.75" },
    { "value": "+6.00", "label": "+6.00" },
    { "value": "+6.50", "label": "+6.50" },
    { "value": "+7.00", "label": "+7.00" },
    { "value": "+7.50", "label": "+7.50" },
    { "value": "+8.00", "label": "+8.00" },
    { "value": "+8.50", "label": "+8.50" },
    { "value": "+9.00", "label": "+9.00" },
    { "value": "+9.50", "label": "+9.50" },
    { "value": "+10.00", "label": "+10.00" },
    { "value": "+10.50", "label": "+10.50" },
    { "value": "+11.00", "label": "+11.00" },
    { "value": "+11.50", "label": "+11.50" },
    { "value": "+12.00", "label": "+12.00" },
    { "value": "+12.50", "label": "+12.50" },
    { "value": "+13.00", "label": "+13.00" },
    { "value": "+13.50", "label": "+13.50" },
    { "value": "+14.00", "label": "+14.00" },
    { "value": "+14.50", "label": "+14.50" },
    { "value": "+15.00", "label": "+15.00" },
    { "value": "+15.50", "label": "+15.50" },
    { "value": "+16.00", "label": "+16.00" },
    { "value": "+16.50", "label": "+16.50" },
    { "value": "+17.00", "label": "+17.00" },
    { "value": "+17.50", "label": "+17.50" },
    { "value": "+18.00", "label": "+18.00" },
    { "value": "+18.50", "label": "+18.50" },
    { "value": "+19.00", "label": "+19.00" },
    { "value": "+19.50", "label": "+19.50" },
    { "value": "+20.00", "label": "+20.00" }
    
  ];

  cylinderOptions = [
    { "value": "-0.25", "label": "-0.25" },
    { "value": "-0.50", "label": "-0.50" },
    { "value": "-0.75", "label": "-0.75" },
    { "value": "-1.00", "label": "-1.00" },
    { "value": "-1.25", "label": "-1.25" },
    { "value": "-1.50", "label": "-1.50" },
    { "value": "-1.75", "label": "-1.75" },
    { "value": "-2.00", "label": "-2.00" },
    { "value": "-2.25", "label": "-2.25" },
    { "value": "-2.50", "label": "-2.50" },
    { "value": "-2.75", "label": "-2.75" },
    { "value": "-3.00", "label": "-3.00" },
    { "value": "-3.25", "label": "-3.25" },
    { "value": "-3.50", "label": "-3.50" },
    { "value": "-3.75", "label": "-3.75" },
    { "value": "-4.00", "label": "-4.00" },
    { "value": "-4.25", "label": "-4.25" },
    { "value": "-4.50", "label": "-4.50" },
    { "value": "-4.75", "label": "-4.75" },
    { "value": "-5.00", "label": "-5.00" },
    { "value": "-5.25", "label": "-5.25" },
    { "value": "-5.50", "label": "-5.50" },
    { "value": "-5.75", "label": "-5.75" },
    { "value": "-6.00", "label": "-6.00" },
    { "value": "0.00", "label": "0.00" },
    { "value": "+0.25", "label": "+0.25" },
    { "value": "+0.50", "label": "+0.50" },
    { "value": "+0.75", "label": "+0.75" },
    { "value": "+1.00", "label": "+1.00" },
    { "value": "+1.25", "label": "+1.25" },
    { "value": "+1.50", "label": "+1.50" },
    { "value": "+1.75", "label": "+1.75" },
    { "value": "+2.00", "label": "+2.00" },
    { "value": "+2.25", "label": "+2.25" },
    { "value": "+2.50", "label": "+2.50" },
    { "value": "+2.75", "label": "+2.75" },
    { "value": "+3.00", "label": "+3.00" },
    { "value": "+3.25", "label": "+3.25" },
    { "value": "+3.50", "label": "+3.50" },
    { "value": "+3.75", "label": "+3.75" },
    { "value": "+4.00", "label": "+4.00" },
    { "value": "+4.25", "label": "+4.25" },
    { "value": "+4.50", "label": "+4.50" },
    { "value": "+4.75", "label": "+4.75" },
    { "value": "+5.00", "label": "+5.00" },
    { "value": "+5.25", "label": "+5.25" },
    { "value": "+5.50", "label": "+5.50" },
    { "value": "+5.75", "label": "+5.75" },
    { "value": "+6.00", "label": "+6.00" }
  ];

  axisOptions = [
    { "value": "0", "label": "0" },
    { "value": "5", "label": "5" },
    { "value": "10", "label": "10" },
    { "value": "15", "label": "15" },
    { "value": "20", "label": "20" },
    { "value": "25", "label": "25" },
    { "value": "30", "label": "30" },
    { "value": "35", "label": "35" },
    { "value": "40", "label": "40" },
    { "value": "45", "label": "45" },
    { "value": "50", "label": "50" },
    { "value": "55", "label": "55" },
    { "value": "60", "label": "60" },
    { "value": "65", "label": "65" },
    { "value": "70", "label": "70" },
    { "value": "75", "label": "75" },
    { "value": "80", "label": "80" },
    { "value": "85", "label": "85" },
    { "value": "90", "label": "90" },
    { "value": "95", "label": "95" },
    { "value": "100", "label": "100" },
    { "value": "105", "label": "105" },
    { "value": "110", "label": "110" },
    { "value": "115", "label": "115" },
    { "value": "120", "label": "120" },
    { "value": "125", "label": "125" },
    { "value": "130", "label": "130" },
    { "value": "135", "label": "135" },
    { "value": "140", "label": "140" },
    { "value": "145", "label": "145" },
    { "value": "150", "label": "150" },
    { "value": "155", "label": "155" },
    { "value": "160", "label": "160" },
    { "value": "165", "label": "165" },
    { "value": "170", "label": "170" },
    { "value": "175", "label": "175" },
    { "value": "180", "label": "180" }
  ];

  // Adjusted IDs to align with HTML flow (4, 5, 6, 7) while keeping your EXACT form control names
  prescriptionSteps = [
    { id: 4, label: 'Current Spectacle Prescription', controls: { sph_RE: 'sph_RE_current', cyl_RE: 'cyl_RE_current', axis_RE: 'axis_RE_current', sph_LE: 'sph_LE_current', cyl_LE: 'cyl_LE_current', axis_LE: 'axis_LE_current' }},
    { id: 5, label: 'Retinoscopy Prescription', controls: { sph_RE: 'sph_RE_dry', cyl_RE: 'cyl_RE_dry', axis_RE: 'axis_RE_dry', sph_LE: 'sph_LE_dry', cyl_LE: 'cyl_LE_dry', axis_LE: 'axis_LE_dry' }},
    { id: 6, label: 'Cycloplegic Retinoscopy Prescription', controls: { sph_RE: 'sph_RE_cyclo', cyl_RE: 'cyl_RE_cyclo', axis_RE: 'axis_RE_cyclo', sph_LE: 'sph_LE_cyclo', cyl_LE: 'cyl_LE_cyclo', axis_LE: 'axis_LE_cyclo' }},
    { id: 7, label: 'Final Accepted Prescription', controls: { sph_RE: 'sph_RE_final', cyl_RE: 'cyl_RE_final', axis_RE: 'axis_RE_final', sph_LE: 'sph_LE_final', cyl_LE: 'cyl_LE_final', axis_LE: 'axis_LE_final' }},
  ];

// VA options for BCVA dropdowns
  vaDistanceOptions = [
    "6/4", "6/5", "6/6", "6/6P", "6/7.5", "6/7.5P", "6/9", "6/9P",
    "6/12", "6/12P", "6/18", "6/18P", "6/24", "6/24P", "6/36", "6/36P",
    "6/60", "5/60", "4/60", "3/60", "2/60", "1/60", "FC 1/2 M", "FCCF",
    "HM(+)", "PL+ PR ACCURATE", "PL + PR INACCURATE", "FIXING AND FOLLOWING LIGHT",
    "NPL", "DEFERRED"
  ];

  vaNearOptions = [
  { "value": "NO TEST", "label": "NO TEST" },
  { "value": "N6", "label": "N6" },
  { "value": "N8", "label": "N8" },
  { "value": "N10", "label": "N10" },
  { "value": "N12", "label": "N12" },
  { "value": "N14", "label": "N14" },
  { "value": "N18", "label": "N18" },
  { "value": "N24", "label": "N24" },
  { "value": "N36", "label": "N36" },
  { "value": "N60", "label": "N60" },
  { "value": "LESS THEN N60", "label": "LESS THEN N60" }
];
  // Manage visibility/validation of prescription steps
  public prescriptionApplicableMap: Record<number, boolean> = {
    4: true, 5: true, 6: true, 7: true
  };

  // Track loading state to prevent UI flicker
  public dataLoaded: boolean = false;
  public showDurationField: boolean = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
  ) {   
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');

      if (!this.reference_number || this.reference_number === "null" || this.reference_number === "undefined") {
        this.openModal();
      } else {
        this.apiService.getParticipant().subscribe((res: any) => {
          const participants: any[] = res.body ? res.body : res;
          const matchedParticipant = participants.find(
            (p: any) => p.reference_number === this.reference_number
          );

          if (matchedParticipant) {
            this.participantData = {
              ...matchedParticipant,
              name: matchedParticipant.name 
                ? `${matchedParticipant.name} ${matchedParticipant.surname || ''}`.trim() 
                : matchedParticipant.contact_first_name || 'N/A'
            };
            
            this.refravtionForm.patchValue({
              eye: matchedParticipant.eye || 'BOTH_EYE'
            });
          }
        });

        // Fetch actual complaints from the complaint table to check if any exist
        this.checkComplaintsAndManageDuration(this.reference_number);
      }
    });
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
    this.reference_number = user.reference_number;
    this.participantData = user;
    
    this.refravtionForm.patchValue({
      eye: user.eye || 'BOTH_EYE'
    });

    this.checkComplaintsAndManageDuration(this.reference_number);
    this.patchData();
  }

  // Unified helper to check database complaints and handle duration visibility & step jumping
  private checkComplaintsAndManageDuration(refNo: string) {
    this.apiService.getObservationComplaints(refNo).subscribe((res: any) => {
      let hasRealComplaints = false;

      if (res && res.body && res.body[0]) {
        const saved = Array.isArray(res.body[0].selected_complaint)
          ? res.body[0].selected_complaint
          : (typeof res.body[0].selected_complaint === 'string' 
              ? res.body[0].selected_complaint.split(',').map((s: string) => s.trim()) 
              : []);

        hasRealComplaints = saved.some((c: string) => 
          c && c !== 'NO COMPLAINTS' && c !== 'NO COMPLAINTS/observations'
        );
      }

      this.showDurationField = hasRealComplaints;

      const durationControl = this.refravtionForm.get('duration');
      if (!hasRealComplaints) {
        durationControl?.setValue(null);
        durationControl?.clearValidators();
        
        // Skip Step 1 automatically if there are no complaints to avoid a blank screen
        if (this.currentStep === 1) {
          this.currentStep = 2;
        }
      } else {
        durationControl?.setValidators([Validators.required]);
      }
      durationControl?.updateValueAndValidity();

      // Reveal UI smoothly once checks complete
      this.dataLoaded = true;
    }, () => {
      // Fallback on error
      this.showDurationField = true;
      this.dataLoaded = true;
    });
  }

  patchData(){
    this.apiService.getrefractionExamination(this.reference_number).subscribe((res: any) => {
      if (res && !res.error && res.body) {
        const data = res.body;
        console.log(data.duration)
        if (data.duration !== undefined && data.duration !== null) {
          data.duration = String(data.duration);
        }
        this.refravtionForm.patchValue(data);
        this.refravtionForm.disable();
      }
    });
  }

  ngOnInit() {
    this.refravtionForm = this.fb.group({
      // Background fields (removed validators to avoid silent block since they aren't on screen)
      chief_complaint: [''],
      eye: [''],
      
      duration: ['', Validators.required],
      ocular_alignment_remarks: ['', Validators.required],
      additional_ocular_complaint: [false, Validators.required],

      sph_RE_current: [''], cyl_RE_current: [''], axis_RE_current: [''],
      sph_LE_current: [''], cyl_LE_current: [''], axis_LE_current: [''],

      sph_RE_dry: [''], cyl_RE_dry: [''], axis_RE_dry: [''],
      sph_LE_dry: [''], cyl_LE_dry: [''], axis_LE_dry: [''],

      sph_RE_cyclo: [''], cyl_RE_cyclo: [''], axis_RE_cyclo: [''],
      sph_LE_cyclo: [''], cyl_LE_cyclo: [''], axis_LE_cyclo: [''],

      sph_RE_final: [''], cyl_RE_final: [''], axis_RE_final: [''],
      sph_LE_final: [''], cyl_LE_final: [''], axis_LE_final: [''],

      se_RE: [''], se_LE: [''],
      bcva_RE: [''], bcva_LE: [''],

      add_RE: [''], add_LE: [''],
      npc: ['']
    });
  }

  // ---- Dynamic Prescription Toggles Logic ----
  public isPrescriptionStepActive(stepId: number): boolean {
    return this.prescriptionApplicableMap[stepId] ?? true;
  }

  public togglePrescriptionStep(stepId: number, event: any) {
    const isActive = event.detail.checked;
    this.prescriptionApplicableMap[stepId] = isActive;
    this.toggleStepValidators(stepId, isActive);
  }

  private toggleStepValidators(stepId: number, enable: boolean) {
    const stepConfig = this.prescriptionSteps.find((s) => s.id === stepId);
    if (!stepConfig) return;

    Object.values(stepConfig.controls).forEach((controlName) => {
      const control = this.refravtionForm.get(controlName);
      if (enable) {
        control?.enable();
      } else {
        control?.reset();
        control?.disable();
      }
    });
  }
  // --------------------------------------------

  nextStep() {
    this.submitted = true;

    // If we are on Step 1, but duration field is hidden (no complaints), jump straight to Step 2
  if (this.currentStep === 1 && !this.showDurationField) {
    this.currentStep = 2;
    this.submitted = false;
    return;
  }
    // Step 1 Validation (Duration)
    if (this.currentStep === 1) {
      if (this.refravtionForm.get('duration')?.invalid) return;
    }

    // Step 2 Validation and Routing (Additional Complaint)
    if (this.currentStep === 2) {
      this.submitted = false;
      const additionalComplaint = this.refravtionForm.get('additional_ocular_complaint')?.value;

      // If user clicked "No" on additional complaint, skip Step 3 (Alignment)
      if (additionalComplaint === false) {
        this.refravtionForm.patchValue({ ocular_alignment_remarks: null });
        this.refravtionForm.get('ocular_alignment_remarks')?.clearValidators();
        this.refravtionForm.get('ocular_alignment_remarks')?.updateValueAndValidity();

        this.currentStep = 4; // Jump to prescriptions
        return;
      }
    }

    // Step 3 Validation (Ocular Alignment)
    if (this.currentStep === 3) {
      if (this.refravtionForm.get('ocular_alignment_remarks')?.invalid) return;
    }

    this.submitted = false;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {

      // Going back from Step 4 (Prescriptions) when additional complaint was "No"
      if (this.currentStep === 4) {
        const additionalComplaint = this.refravtionForm.get('additional_ocular_complaint')?.value;
        if (additionalComplaint === false) {
          this.currentStep = 2;
          this.submitted = false;
          return;
        }
      }

      // Default step decrement
      this.currentStep--;
      // If we backed up into Step 1, but there is no duration field, skip back past it
    if (this.currentStep === 1 && !this.showDurationField) {
      // Handle accordingly based on your layout flow, or stay at 2
      this.currentStep = 2; 
    }

      this.submitted = false;
    }
  }

  // Converts text inputs like "6 months", "1 year 2 months", "3 years" into a backend-ready integer
private parseDurationToInteger(val: any): number {
  if (val === null || val === undefined || val === '') {
    return 1;
  }

  // Convert to string and lowercase for uniform parsing
  const str = String(val).toLowerCase().trim();

  // Extract numeric years and months using regular expressions
  const yearMatch = str.match(/(\d+)\s*(?:year|yr|y)/);
  const monthMatch = str.match(/(\d+)\s*(?:month|mo|m)/);

  let years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
  let months = monthMatch ? parseInt(monthMatch[1], 10) : 0;

  // If input is purely a raw number like "3" or "2"
  if (!yearMatch && !monthMatch && !isNaN(Number(str))) {
    const rawNum = parseInt(str, 10);
    return rawNum < 1 ? 1 : rawNum;
  }

  // Rule 1: Anything less than 1 year total (e.g. "6 months", "2 months") defaults to 1
  if (years < 1) {
    return 1;
  }

  // Rule 2: 5 or 6+ months rounds up to the next full year
  if (months >= 5) {
    years += 1;
  }

  return years;
}

submitForm() {
  this.submitted = true;
  if (this.refravtionForm.invalid) {
    this.apiService.presentToast('Please fill all fields', 'danger');
    return;
  }

  this.apiService.isLoading.next(true);

  // Get raw duration input and format it to integer according to business logic
  const rawDuration = this.refravtionForm.get('duration')?.value;
  const formattedDuration = this.parseDurationToInteger(rawDuration);

  const formData = { 
    ...this.refravtionForm.value, 
    duration: formattedDuration, // Sent to backend as integer
    reference_number: this.reference_number, 
    refraction_and_examination: true 
  };

  this.apiService.RefractionExamination(formData).subscribe((res: any) => {
    this.apiService.isLoading.next(false);
    if (res.error === false) {
      this.apiService.presentToast(res.message);
      this.router.navigate(['/layout/dispensing'], { queryParams: { reference_number: this.reference_number } });
    } else {
      this.apiService.presentToast(res.message, 'danger');
    }
  }, () => {
    this.apiService.isLoading.next(false);
    this.apiService.presentToast('Something Went Wrong', 'danger');
  });
}

  sendnotification(value: boolean) {
    this.refravtionForm.patchValue({ additional_ocular_complaint: value });
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }

  backLocation() {
    this.router.navigate(['/layout/refraction-spectacle-presentation'], { queryParams: { reference_number: this.reference_number } });
  }

  onEdit() {
    this.refravtionForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }
}