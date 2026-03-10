import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-surgery-treatment-history',
  templateUrl: './surgery-treatment-history.component.html',
  styleUrls: ['./surgery-treatment-history.component.scss'],
  standalone: false
})
export class SurgeryTreatmentHistoryComponent implements OnInit {
  @ViewChild('dateModal', { static: false }) dateModal!: IonModal;
  dispenseForm!: FormGroup;
  currentStep = 1;
  totalSteps = 3;
  reference_number: any;
  stepSubmitted: boolean = false;
  globalError: string = "";
  participantData: any;
  profileRes: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.route.paramMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      console.log('Received ID:', this.reference_number);
      if (this.reference_number == "null" || this.reference_number == null) {
        this.openModal()
      } else {
        let body = {
          reference_number: this.reference_number
        }
        this.apiService.profile(body).subscribe((res: any) => {
          this.profileRes = res;
          if (this.profileRes) {
            this.participantData = this.profileRes;
            console.log(this.participantData)
          } else {
            this.participantData = {
              id: '',
              name: '',
              age: null,
              grade: '',
              school: ''
            };
          }
        })
      }
    });
  }

  ngOnInit() {
    this.dispenseForm = this.fb.group({
      surgeryDone: [null, Validators.required],
      treatmentEye: [''],
      searchTerm: [''],
      medicalIssues: [''],
      leftEye: this.fb.group({
        trauma: [false],
        cataract: [false],
        squint: [false],
        lid: [false],
        other: [false],
        none: [false]
      }),
      rightEye: this.fb.group({
        trauma: [false],
        cataract: [false],
        squint: [false],
        lid: [false],
        other: [false],
        none: [false]
      })
    });

    // Watch for changes in surgeryDone to toggle validators
    this.dispenseForm.get('surgeryDone')?.valueChanges.subscribe(value => {
      const treatmentEyeControl = this.dispenseForm.get('treatmentEye');
      
      if (value === true) {
        // If Yes, make treatmentEye required
        treatmentEyeControl?.setValidators([Validators.required]);
      } else if (value === false) {
        // If No, remove validators and clear value
        treatmentEyeControl?.clearValidators();
        treatmentEyeControl?.setValue('');
      }
      
      treatmentEyeControl?.updateValueAndValidity();
    });

    this.dispenseForm.get('leftEye')?.valueChanges.subscribe(values => {
      if (values.none) {
        this.dispenseForm.get('leftEye')?.patchValue({
          trauma: false,
          cataract: false,
          squint: false,
          lid: false,
          other: false
        }, { emitEvent: false });
      } else {
        if (values.trauma || values.cataract || values.squint || values.lid || values.other) {
          this.dispenseForm.get('leftEye.none')?.setValue(false, { emitEvent: false });
        }
      }
    });

    this.dispenseForm.get('rightEye')?.valueChanges.subscribe(values => {
      if (values.none) {
        this.dispenseForm.get('rightEye')?.patchValue({
          trauma: false,
          cataract: false,
          squint: false,
          lid: false,
          other: false
        }, { emitEvent: false });
      } else {
        if (values.trauma || values.cataract || values.squint || values.lid || values.other) {
          this.dispenseForm.get('rightEye.none')?.setValue(false, { emitEvent: false });
        }
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
    this.participantData = user;
    this.reference_number = user.reference_number;
    if (this.reference_number !== "null" || this.reference_number !== null) {
      this.apiService.getSurgeryHistory(this.reference_number).subscribe(res => {
        if (res && !res.error && res.body) {
          const data = res.body;
          this.dispenseForm.patchValue({
            surgeryDone: data.surgery_done,
            treatmentEye: data.treated_eye,
            searchTerm: data.surgery_type,
            medicalIssues: data.other_surgery_details,
            leftEye: data.surgery_history ? data.surgery_history.leftEye : {},
            rightEye: data.surgery_history ? data.surgery_history.rightEye : {}
          });
          this.dispenseForm.disable();
        }
      });
    }
  }

  onSurgerySelection(value: boolean) {
    this.dispenseForm.get('surgeryDone')?.setValue(value);
  }

  nextStep() {
    this.stepSubmitted = true;
    this.globalError = "";

    const surgeryDone = this.dispenseForm.get('surgeryDone')?.value;

    // Check if surgeryDone is false - if so, skip to save
    if (surgeryDone === false) {
      this.submitForm();
      return;
    }

    // Validate current step
    if (this.currentStep === 1) {
      if (this.dispenseForm.get('surgeryDone')?.invalid) {
        return;
      }
      // Only validate treatmentEye if surgery was done
      if (surgeryDone === true && this.dispenseForm.get('treatmentEye')?.invalid) {
        return;
      }
    }

    this.stepSubmitted = false;
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.stepSubmitted = false;
      this.globalError = "";
    }
  }

  backLocation() {
    this.router.navigate(['/layout/profile'], { queryParams: { reference_number: this.reference_number } });
  }

  submitForm() {
    if(this.dispenseForm.value.surgeryDone === false){
      this.nevigateProfile();
      return;
    }
    this.stepSubmitted = true;
    this.globalError = "";

      // If surgery done, validate all fields
      if (this.dispenseForm.invalid) {
        this.globalError = "Please fill in all required details.";
        return;
      }

    this.apiService.isLoading.next(true);
    const surgeryHistory = {
      leftEye: this.dispenseForm.value.leftEye,
      rightEye: this.dispenseForm.value.rightEye
    };

    const Payload = {
      reference_number: this.reference_number,
      surgery_done: this.dispenseForm.value.surgeryDone,
      treated_eye: this.dispenseForm.value.treatmentEye || null,
      surgery_type: this.dispenseForm.value.searchTerm || null,
      other_surgery_details: this.dispenseForm.value.medicalIssues || null,
      surgery_history: surgeryHistory,
      surgery_treatment_history: true
    };

    this.apiService.SurgeryHistory(Payload).subscribe((res: any) => {
      this.apiService.isLoading.next(false);
      if (res.error === false) {
        this.apiService.presentToast(res.message);
        this.router.navigate(['/layout/profile']);
      } else {
        this.apiService.presentToast(res.message, 'danger');
      }
    }, err => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast('Something Went Wrong', 'danger');
    });
  }

  nevigateProfile() {
     this.router.navigate(['/layout/profile']);
  }

  onEdit() {
    this.dispenseForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile']);
  }
}