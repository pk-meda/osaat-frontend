// family-history.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.scss'],
  standalone: false
})
export class FamilyHistoryComponent implements OnInit {
  @ViewChild('dateModal', { static: false }) dateModal!: IonModal;
  dispenseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;
  submitted: boolean = false;
  isSendNotification: any;
  reference_number: any;

  formDisabled: boolean = false;
  participantData: any;
  profileRes: any;

  relationshipOptions = [
    'Grandfather',
    'Grandmother',
    'Father',
    'Mother',
    'Sister',
    'Brother',
    'Other'
  ];

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
      } else {
        this.patchedData();
      }
      console.log('Received ID:', this.reference_number);
    });
    let body = {
      reference_number: this.reference_number
    };
    this.apiService.profile(body).subscribe((res: any) => {
      this.profileRes = res;
      if (this.profileRes) {
        this.participantData = this.profileRes;
        console.log(this.participantData);
      } else {
        this.participantData = {
          id: '',
          name: '',
          age: null,
          grade: '',
          school: ''
        };
      }
    });
  }

  ngOnInit() {
    this.dispenseForm = this.fb.group({
      search_term: [''],
      Hypertension: [null, Validators.required],
      Hypertension_relationship: [[]],
      Diabetes: [null, Validators.required],
      Diabetes_relationship: [[]],
      Cataract: [null, Validators.required],
      Cataract_relationship: [[]],
      Glaucoma: [null, Validators.required],
      Glaucoma_relationship: [[]],
      Other_glasses: [null, Validators.required],
      Other_glasses_relationship: [[]],
      Other: [null, Validators.required],
      Other_relationship: [[]],
      Other_text: ['']
    });

    // Add conditional validators for relationships when answer is 'yes'
    this.setupConditionalValidators();
  }

  setupConditionalValidators() {
    const conditions = ['Hypertension', 'Diabetes', 'Cataract', 'Glaucoma', 'Other_glasses', 'Other'];
    
    conditions.forEach(condition => {
      this.dispenseForm.get(condition)?.valueChanges.subscribe(value => {
        const relationshipControl = this.dispenseForm.get(`${condition}_relationship`);
        if (value === 'yes') {
          relationshipControl?.setValidators([Validators.required]);
        } else {
          relationshipControl?.clearValidators();
          relationshipControl?.setValue([]);
        }
        relationshipControl?.updateValueAndValidity();
      });
    });

    // Conditional validator for Other_text
    this.dispenseForm.get('Other')?.valueChanges.subscribe(value => {
      const otherTextControl = this.dispenseForm.get('Other_text');
      if (value === 'yes') {
        otherTextControl?.setValidators([Validators.required]);
      } else {
        otherTextControl?.clearValidators();
        otherTextControl?.setValue('');
      }
      otherTextControl?.updateValueAndValidity();
    });
  }

  patchedData() {
    if (this.reference_number) {
      this.apiService.getFamilyHistory(this.reference_number).subscribe(res => {
        if (res && !res.error && res.body) {
          const data = res.body;
          console.log(res.body.Hypertension,'family history data');
          this.dispenseForm.patchValue({
            search_term: data.search_term || '',
            Hypertension: data?.Hypertension === true ? 'yes' : 'no',
            Hypertension_relationship: data?.Hypertension_relationship || [],
            Diabetes: data?.Diabetes === true ? 'yes' : 'no',
            Diabetes_relationship: data?.Diabetes_relationship || [],
            Cataract: data?.Cataract === true ? 'yes' : 'no',
            Cataract_relationship: data?.Cataract_relationship || [],
            Glaucoma: data?.Glaucoma === true? 'yes' : 'no',
            Glaucoma_relationship: data?.Glaucoma_relationship || [],
            Other_glasses: data?.Other_glasses === true ? 'yes' : 'no',
            Other_glasses_relationship: data?.Other_glasses_relationship || [],
            Other: data?.Other === true? 'yes' : 'no',
            Other_relationship: data?.Other_relationship || [],
            Other_text: data?.Other_text || ''
          });

          this.dispenseForm.disable();
          this.formDisabled = true;
        }
      });
    }
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
    this.participantData = user;
    this.reference_number = user.reference_number;
    this.patchedData();
  }

  submitForm() {
    this.submitted = true;
    if (this.dispenseForm.invalid) {
      Object.keys(this.dispenseForm.controls).forEach(field => {
        const control = this.dispenseForm.get(field);
        if (control?.invalid) {
          console.log(`Invalid field: ${field}`, control.errors);
        }
        control?.markAsTouched();
      });
      this.apiService.presentToast('Please fill all required fields', 'danger');
      return;
    }

    this.apiService.isLoading.next(true);

    const toBool = (val: string) => val === 'yes';

    const Payload = {
      reference_number: this.reference_number,
      family_history: true,
      Hypertension: toBool(this.dispenseForm.value.Hypertension),
      Hypertension_relationship: this.dispenseForm.value.Hypertension_relationship,
      Diabetes: toBool(this.dispenseForm.value.Diabetes),
      Diabetes_relationship: this.dispenseForm.value.Diabetes_relationship,
      Cataract: toBool(this.dispenseForm.value.Cataract),
      Cataract_relationship: this.dispenseForm.value.Cataract_relationship,
      Glaucoma: toBool(this.dispenseForm.value.Glaucoma),
      Glaucoma_relationship: this.dispenseForm.value.Glaucoma_relationship,
      Other_glasses: toBool(this.dispenseForm.value.Other_glasses),
      Other_glasses_relationship: this.dispenseForm.value.Other_glasses_relationship,
      Other: toBool(this.dispenseForm.value.Other),
      Other_relationship: this.dispenseForm.value.Other_relationship,
      Other_text: this.dispenseForm.value.Other_text,
      none: false,
      search_term: this.dispenseForm.value.search_term
    };

    this.apiService.FamilyHistory(Payload).subscribe(
      res => {
        this.apiService.isLoading.next(false);
        if (res.error === false) {
          this.apiService.presentToast(res.message);
          this.router.navigate(['/layout/profile'], {
            queryParams: { reference_number: this.reference_number }
          });
        } else {
          this.apiService.presentToast(res.message, 'danger');
        }
      },
      err => {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast('Something Went Wrong', 'danger');
      }
    );

    console.log("Form submitted successfully", Payload);
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  nevigateProfile() {
    this.apiService.nevigateProfile(this.reference_number);
  }

  onEdit() {
    this.dispenseForm.enable();
    this.formDisabled = false;
  }

  onDelete() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }
}