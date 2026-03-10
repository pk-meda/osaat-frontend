// refraction-spectacle-presentation.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-refraction-spectacle-presentation',
  templateUrl: './refraction-spectacle-presentation.component.html',
  styleUrls: ['./refraction-spectacle-presentation.component.scss'],
  standalone: false
})
export class RefractionSpectaclePresentationComponent implements OnInit {

  increments = [
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

  increments1 = [
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

  increments2 = [
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

  // VA options matching the visual acuity component
  vaDistanceOptions = [
    "6/4", "6/5", "6/6", "6/6P", "6/7.5", "6/7.5P", "6/9", "6/9P",
    "6/12", "6/12P", "6/18", "6/18P", "6/24", "6/24P", "6/36", "6/36P",
    "6/60", "5/60", "4/60", "3/60", "2/60", "1/60", "FC 1/2 M", "FCCF",
    "HM(+)", "PL+ PR ACCURATE", "PL + PR INACCURATE", "FIXING AND FOLLOWING LIGHT",
    "NPL", "DEFERRED"
  ];

  vaNearOptions = [
    "N6", "N8", "N10", "N12", "N14", "N18", "N24", "N36", "N60", "LESS THEN N60"
  ];

  @ViewChild('dateModal', { static: false }) dateModal!: IonModal;
  dispenseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 4; // Updated to 4 steps
  submitted: boolean = false;
  reference_number: any;
  participantData: any;
  profileRes: any;

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
      if (this.reference_number == "null" || this.reference_number == null) {
        this.openModal();
      }
    });
  }

  ngOnInit() {
    this.dispenseForm = this.fb.group({
      // Original Spectacle Prescription fields - Step 1 & 2
      sphericalPrescriptionRE: ['', Validators.required],
      cylindricalPrescriptionRE: [''],
      axisCylinderRE: [''],
      sphericalPrescriptionLE: ['', Validators.required],
      cylindricalPrescriptionLE: [''],
      axisCylinderLE: [''],
      
      // New VA fields - Step 3 & 4
      aidedDistanceVA_RE: ['', Validators.required],
      aidedDistanceVA_LE: ['', Validators.required],
      aidedNearVA_RE: [''],
      aidedNearVA_LE: ['']
    });
  }

  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      if (selectedUser) {
        this.handleUser(selectedUser);
      }
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }

  handleUser(user: any) {
    this.reference_number = user.reference_number;
    this.participantData = user;
    this.getRefractionSpectacle();
  }

  nextStep() {
    this.submitted = true;
    
    if (this.currentStep === 1) {
      // Validate RE prescription
      if (this.dispenseForm.get('sphericalPrescriptionRE')?.invalid) {
        this.dispenseForm.get('sphericalPrescriptionRE')?.markAsTouched();
        this.dispenseForm.get('cylindricalPrescriptionRE')?.markAsTouched();
        this.dispenseForm.get('axisCylinderRE')?.markAsTouched();
        return;
      }
    } else if (this.currentStep === 2) {
      // Validate LE prescription
      if (this.dispenseForm.get('sphericalPrescriptionLE')?.invalid) {
        this.dispenseForm.get('sphericalPrescriptionLE')?.markAsTouched();
        this.dispenseForm.get('cylindricalPrescriptionLE')?.markAsTouched();
        this.dispenseForm.get('axisCylinderLE')?.markAsTouched();
        return;
      }
    } else if (this.currentStep === 3) {
      // Validate distance VA
      if (
        this.dispenseForm.get('aidedDistanceVA_RE')?.invalid ||
        this.dispenseForm.get('aidedDistanceVA_LE')?.invalid
      ) {
        this.dispenseForm.get('aidedDistanceVA_RE')?.markAsTouched();
        this.dispenseForm.get('aidedDistanceVA_LE')?.markAsTouched();
        return;
      }
    }
    
    this.submitted = false;
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  submitForm() {
    this.submitted = true;
    
    // Check all required fields
    const requiredFields = [
      'sphericalPrescriptionRE',
      'sphericalPrescriptionLE',
      'aidedDistanceVA_RE',
      'aidedDistanceVA_LE'
    ];
    
    const hasInvalidRequired = requiredFields.some(field => 
      this.dispenseForm.get(field)?.invalid
    );
    
    if (hasInvalidRequired) {
      requiredFields.forEach(field => {
        this.dispenseForm.get(field)?.markAsTouched();
      });
      this.apiService.presentToast('Please fill all required fields', 'danger');
      return;
    }

    const formData = {
      reference_number: this.reference_number,
      // Original prescription fields
      spherical_prescription_re: this.dispenseForm.value.sphericalPrescriptionRE,
      cylindrical_prescription_re: this.dispenseForm.value.cylindricalPrescriptionRE || null,
      axis_cylinder_re: this.dispenseForm.value.axisCylinderRE || null,
      spherical_prescription_le: this.dispenseForm.value.sphericalPrescriptionLE,
      cylindrical_prescription_le: this.dispenseForm.value.cylindricalPrescriptionLE || null,
      axis_cylinder_le: this.dispenseForm.value.axisCylinderLE || null,
      // New VA fields
      aided_distance_va_re: this.dispenseForm.value.aidedDistanceVA_RE,
      aided_distance_va_le: this.dispenseForm.value.aidedDistanceVA_LE,
      aided_near_va_re: this.dispenseForm.value.aidedNearVA_RE || null,
      aided_near_va_le: this.dispenseForm.value.aidedNearVA_LE || null,
      refraction_spectacle_presentation: true
    };

    this.apiService.RefractionSpectacle(formData).subscribe(
      res => {
        if (res.error === false) {
          this.apiService.presentToast(res.message);
          this.router.navigate(['/layout/profile'], { 
            queryParams: { reference_number: this.reference_number } 
          });
        } else {
          this.apiService.presentToast(res.message, 'danger');
        }
      },
      error => {
        this.apiService.presentToast('Something went wrong', 'danger');
      }
    );
  }

  getRefractionSpectacle(){

    this.apiService.GetRefractionSpectacle(this.reference_number).subscribe((res:any)=>{
      if(res.error === false){
        this.profileRes = res.body; 
        this.dispenseForm.patchValue({
          sphericalPrescriptionRE: this.profileRes.spherical_prescription_re,
          cylindricalPrescriptionRE: this.profileRes.cylindrical_prescription_re,
          axisCylinderRE: this.profileRes.axis_cylinder_re,
          sphericalPrescriptionLE: this.profileRes.spherical_prescription_le,
          cylindricalPrescriptionLE: this.profileRes.cylindrical_prescription_le,
          axisCylinderLE: this.profileRes.axis_cylinder_le,
          aidedDistanceVA_RE: this.profileRes.aided_distance_va_re,
          aidedDistanceVA_LE: this.profileRes.aided_distance_va_le,
          aidedNearVA_RE: this.profileRes.aided_near_va_re,
          aidedNearVA_LE: this.profileRes.aided_near_va_le
        });
        this.dispenseForm.disable();
      }
    });

  }

  onEdit() {
    this.dispenseForm.enable();
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { 
      queryParams: { reference_number: this.reference_number } 
    });
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }
  onDelete() {
    this.router.navigate(['/layout/profile'], { 
      queryParams: { reference_number: this.reference_number } 
    });
  }
}
