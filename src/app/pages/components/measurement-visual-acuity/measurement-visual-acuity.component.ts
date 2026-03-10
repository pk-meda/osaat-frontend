import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
// import { EvaluationModalComponent } from '../../evaluation-modal/evaluation-modal.component';

@Component({
  selector: 'app-measurement-visual-acuity',
  templateUrl: './measurement-visual-acuity.component.html',
  styleUrls: ['./measurement-visual-acuity.component.scss'],
  standalone: false
})
export class MeasurementVisualAcuityComponent implements OnInit {
  @ViewChild('dateModal', { static: false }) dateModal!: IonModal;

  screeningForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;
  submitted = false;

  reference_number: string | null = null;
  userData: any;
  participantData: any;
  profileRes: any;
  showResultButtons = false;   // toggles Pass/Fail UI
  selectedResult: 'pass' | 'fail' | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private modalController: ModalController
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      if (!this.reference_number) {
        this.openModal();
      }
    });
  }

  ngOnInit() {
    this.buildForm();

    // If you want to prefill from API, uncomment this block
    if (this.reference_number) {
      this.apiService.getVisualAcuity(this.reference_number).subscribe((res: any) => {
        if (res && !res.error && res.body) {
          const d = res.body;
          this.screeningForm.patchValue({
            unaidedDistanceVA_RE: d.unaided_distance_va_re,
            unaidedDistanceVA_LE: d.unaided_distance_va_le,
            unaidedNearVA_RE: d.unaided_near_va_re,
            unaidedNearVA_LE: d.unaided_near_va_le,
            // aidedDistanceVA_RE: d.aided_distance_va_re,
            // aidedDistanceVA_LE: d.aided_distance_va_le,
            // aidedNearVA_RE: d.aided_near_va_re,
            // aidedNearVA_LE: d.aided_near_va_le,
            // phDistanceVA_RE: d.ph_distance_va_re,
            // pdDistanceVA_LE: d.pd_distance_va_le
          });
          this.screeningForm.disable();
        }
      });
    }
  }

  private buildForm() {
    this.screeningForm = this.fb.group({
      unaidedDistanceVA_RE: ['', Validators.required],
      unaidedDistanceVA_LE: ['', Validators.required],
      unaidedNearVA_RE: ['', Validators.required],
      unaidedNearVA_LE: ['', Validators.required],
      // aidedDistanceVA_RE: ['', Validators.required],
      // aidedDistanceVA_LE: ['', Validators.required],
      // aidedNearVA_RE: ['', Validators.required],
      // aidedNearVA_LE: ['', Validators.required],
      // phDistanceVA_RE: ['', Validators.required],
      // pdDistanceVA_LE: ['', Validators.required],
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
    this.reference_number = user?.reference_number ?? null;
        if (this.reference_number) {
      this.apiService.getVisualAcuity(this.reference_number).subscribe((res: any) => {
        if (res && !res.error && res.body) {
          const d = res.body;
          this.screeningForm.patchValue({
            unaidedDistanceVA_RE: d.unaided_distance_va_re,
            unaidedDistanceVA_LE: d.unaided_distance_va_le,
            unaidedNearVA_RE: d.unaided_near_va_re,
            unaidedNearVA_LE: d.unaided_near_va_le,
            // aidedDistanceVA_RE: d.aided_distance_va_re,
            // aidedDistanceVA_LE: d.aided_distance_va_le,
            // aidedNearVA_RE: d.aided_near_va_re,
            // aidedNearVA_LE: d.aided_near_va_le,
            // phDistanceVA_RE: d.ph_distance_va_re,
            // pdDistanceVA_LE: d.pd_distance_va_le
          });
          this.screeningForm.disable();
        }
      });
    }
  }

  private markStepControlsAsTouched(step: number): void {
    const map: Record<number, string[]> = {
      1: ['unaidedDistanceVA_RE', 'unaidedDistanceVA_LE', 'unaidedNearVA_RE', 'unaidedNearVA_LE'],
      2: ['aidedDistanceVA_RE', 'aidedDistanceVA_LE', 'aidedNearVA_RE', 'aidedNearVA_LE'],
      3: ['phDistanceVA_RE', 'pdDistanceVA_LE']
    };
    (map[step] || []).forEach(ctrl => this.screeningForm.get(ctrl)?.markAsTouched());
  }

  nextStep() {
    this.submitted = true;

    if (this.currentStep === 1) {
      if (['unaidedDistanceVA_RE', 'unaidedDistanceVA_LE', 'unaidedNearVA_RE', 'unaidedNearVA_LE']
        .some(c => this.screeningForm.get(c)?.invalid)) {
        this.markStepControlsAsTouched(1);
        return;
      }
    } else if (this.currentStep === 2) {
      if (['aidedDistanceVA_RE', 'aidedDistanceVA_LE', 'aidedNearVA_RE', 'aidedNearVA_LE']
        .some(c => this.screeningForm.get(c)?.invalid)) {
        this.markStepControlsAsTouched(2);
        return;
      }
    }

    this.submitted = false;
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  async submitForm() {
    this.submitted = true;

  if (this.screeningForm.invalid) {
    this.apiService.presentToast('Please fill all fields', 'danger');
    return;
  }

  // ✅ Show Pass/Fail buttons instead of API call
  this.showResultButtons = true;
  }

  onResultSelect(result: 'pass' | 'fail') {
  this.selectedResult = result;

  const v = this.screeningForm.value;
  const body = {
    reference_number: this.reference_number,
    unaided_distance_va_re: v.unaidedDistanceVA_RE,
    unaided_distance_va_le: v.unaidedDistanceVA_LE,
    unaided_near_va_re: v.unaidedNearVA_RE,
    unaided_near_va_le: v.unaidedNearVA_LE,
    measure_visual_acuity: true,
  };
  console.log(body);

  this.apiService.VisualAcuity(body).subscribe(
    (res: any) => {
      if (res.error === false) {
        this.apiService.presentToast(res.message);
        this.apiService.isLoading.next(false);
          this.checkAlreadyDoVATEST(this.selectedResult)
      } else {
        this.apiService.presentToast(res.message, 'danger');
      }
    },
    () => this.apiService.presentToast('Something went wrong', 'danger')
  );
}

  checkAlreadyDoVATEST(result:any){
    let body ={
      reference_number:this.reference_number
    }
    this.apiService.profile(body).subscribe((res:any)=>{
      const data = res;
      if(data.second_screening == true){
          this.router.navigate(['/layout/secoundScreening']);      
      } else if (data.second_screening == false && result === 'fail'){
          this.router.navigate(['/layout/secoundScreening'], { queryParams: { reference_number: this.reference_number } });
      } else {
          this.router.navigate(['/layout/first-screening']);
      }
    })
  }

  backLocation() {
    this.router.navigate(['/layout/profile']);
  }

  nevigateProfile() {
    if (this.reference_number) {
      this.apiService.nevigateProfile(this.reference_number);
    }
  }

  onEdit() {
    this.screeningForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile']);
  }
}
