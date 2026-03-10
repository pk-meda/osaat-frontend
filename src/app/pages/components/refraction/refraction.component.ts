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
    { "value": "+20.00", "label": "+20.00" },
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
    { "value": "-20.00", "label": "-20.00" }
  ];

  cylinderOptions = [
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
    { "value": "-6.00", "label": "-6.00" }
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

  prescriptionSteps = [
    { id: 5, label: 'Current Spectacle Prescription', controls: { sph_RE: 'sph_RE_current', cyl_RE: 'cyl_RE_current', axis_RE: 'axis_RE_current', sph_LE: 'sph_LE_current', cyl_LE: 'cyl_LE_current', axis_LE: 'axis_LE_current' }},
    { id: 6, label: 'Dry Retinoscopy Prescription', controls: { sph_RE: 'sph_RE_dry', cyl_RE: 'cyl_RE_dry', axis_RE: 'axis_RE_dry', sph_LE: 'sph_LE_dry', cyl_LE: 'cyl_LE_dry', axis_LE: 'axis_LE_dry' }},
    { id: 7, label: 'Cycloplegic Retinoscopy Prescription', controls: { sph_RE: 'sph_RE_cyclo', cyl_RE: 'cyl_RE_cyclo', axis_RE: 'axis_RE_cyclo', sph_LE: 'sph_LE_cyclo', cyl_LE: 'cyl_LE_cyclo', axis_LE: 'axis_LE_cyclo' }},
    { id: 8, label: 'Final Accepted Prescription', controls: { sph_RE: 'sph_RE_final', cyl_RE: 'cyl_RE_final', axis_RE: 'axis_RE_final', sph_LE: 'sph_LE_final', cyl_LE: 'cyl_LE_final', axis_LE: 'axis_LE_final' }},
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
  ) {  
    this.route.paramMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      console.log('Received ID:', this.reference_number);
      if (this.reference_number == "null" || this.reference_number == null) {
        this.openModal()
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
    console.log('=== Selected User Details ===');
    console.log('User ID:', user.id);
    console.log('Reference Number:', user.reference_number);
    this.reference_number = user.reference_number;
    console.log(user);
    this.participantData = user;
    this.patchData();
  }

  patchData(){
    this.apiService.getrefractionExamination(this.reference_number).subscribe(res => {
      if (res && !res.error && res.body) {
        const data = res.body;
        console.log(data.duration)
        if (data.duration !== undefined && data.duration !== null) {
          data.duration = String(data.duration);
        }
        this.refravtionForm.patchValue(data)
        this.refravtionForm.disable();
      }
    });
  }

  ngOnInit() {
    this.refravtionForm = this.fb.group({
      chief_complaint: ['', Validators.required],
      eye: ['', Validators.required],
      duration: [''],
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

  nextStep() {
    this.submitted = true;
    if (this.currentStep === 1 && this.refravtionForm.get('chief_complaint')?.invalid) return;
    if (this.currentStep === 2 && (this.refravtionForm.get('eye')?.invalid || this.refravtionForm.get('duration')?.invalid)) return;
    if (this.currentStep === 4 && this.refravtionForm.get('ocular_alignment_remarks')?.invalid) return;
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
    if (this.refravtionForm.invalid) {
      this.apiService.presentToast('Please fill all fields','danger');
      return;
    }
    this.apiService.isLoading.next(true);
    const formData = { ...this.refravtionForm.value, reference_number: this.reference_number, refraction_and_examination: true };
    this.apiService.RefractionExamination(formData).subscribe(res => {
      this.apiService.isLoading.next(false);
      if (res.error === false) {
        this.apiService.presentToast(res.message);
        this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
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
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  onEdit() {
    this.refravtionForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }
}