/*import { Location } from '@angular/common';
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

    if (this.reference_number) {
      this.fetchDataAndPopulate(this.reference_number);
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

  /**  start of non working code
   * Helper to load saved backend Visual Acuity data or fallback to
   * auto-populating from the E-Test stored in localStorage.
   *
  private fetchDataAndPopulate(refNum: string) {
    this.apiService.getVisualAcuity(refNum).subscribe((res: any) => {
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
      } else {
        // Fallback: Populate RE & LE distance fields from localStorage if available
        this.populateFromLocalStorage(refNum);
      }
    });
  }

  private populateFromLocalStorage(refNum: string) {
    const localData = localStorage.getItem('latest_e_test_result');
    if (localData) {
      try {
        const testResult = JSON.parse(localData);
        if (testResult && testResult.reference_number === refNum) {
          this.screeningForm.patchValue({
            unaidedDistanceVA_RE: testResult.right_numeric_va || '',
            unaidedDistanceVA_LE: testResult.left_numeric_va || ''
          });
        }
      } catch (e) {
        console.error('Error reading E-Test result from localStorage', e);
      }
    }
  }*/ //this is end of non working code

   /* private fetchDataAndPopulate(refNum: string) {
  this.apiService.getVisualAcuity(refNum).subscribe({
    next: (res: any) => {
      const d = res?.body ? res.body : res;
      // Populate if backend record already exists
      if (d && (d.unaided_distance_va_re || d.unaided_distance_va_le)) {
        this.screeningForm.patchValue({
          unaidedDistanceVA_RE: d.unaided_distance_va_re || '',
          unaidedDistanceVA_LE: d.unaided_distance_va_le || '',
          unaidedNearVA_RE: d.unaided_near_va_re || '',
          unaidedNearVA_LE: d.unaided_near_va_le || ''
        });
        this.screeningForm.disable();
      } else {
        // Fallback to local storage if API returns empty body
        this.populateFromLocalStorage(refNum);
      }
    },
    error: (err: any) => {
      // 404 Error handler: Backend has no record, pull Distance values from local storage
      console.log('No backend record found (404). Pulling E-Test distance results from localStorage...');
      this.populateFromLocalStorage(refNum);
    }
  });
}



private populateFromLocalStorage(refNum: string) {
  const localData = localStorage.getItem('latest_e_test_result');
  if (!localData) return;

  try {
    const testResult = JSON.parse(localData);
    
    // Match reference number
    if (testResult && testResult.reference_number === refNum) {
      // Populate ONLY the Distance fields from E-Test
      this.screeningForm.patchValue({
        unaidedDistanceVA_RE: testResult.right_numeric_va || '',
        unaidedDistanceVA_LE: testResult.left_numeric_va || ''
      });

      // Mark the populated fields as touched/dirty so Angular UI picks up the changes immediately
      this.screeningForm.get('unaidedDistanceVA_RE')?.markAsTouched();
      this.screeningForm.get('unaidedDistanceVA_LE')?.markAsTouched();
      
      console.log('Populated Distance VA:', {
        RE: testResult.right_numeric_va,
        LE: testResult.left_numeric_va
      });
    }
  } catch (e) {
    console.error('Error parsing latest_e_test_result from localStorage', e);
  }
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
      this.fetchDataAndPopulate(this.reference_number);
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
          // Clear cached local storage after successful backend submission
          localStorage.removeItem('latest_e_test_result');
          this.apiService.presentToast(res.message);
          this.apiService.isLoading.next(false);
          this.checkAlreadyDoVATEST(this.selectedResult);
        } else {
          this.apiService.presentToast(res.message, 'danger');
        }
      },
      () => this.apiService.presentToast('Something went wrong', 'danger')
    );
  }

  checkAlreadyDoVATEST(result: any) {
    let body = {
      reference_number: this.reference_number
    };
    this.apiService.profile(body).subscribe((res: any) => {
      const data = res;
      if (data.second_screening == true) {
        this.router.navigate(['/layout/secoundScreening']);      
      } else if (data.second_screening == false && result === 'fail') {
        //this.router.navigate(['/layout/secoundScreening'], { queryParams: { reference_number: this.reference_number } });
        this.router.navigate(['/layout/refraction-spectacle-presentation'], { queryParams: { reference_number: this.reference_number } });
      } else {
        this.router.navigate(['/layout/first-screening']);
      }
    });
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
*/

import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonModal, ModalController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

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
  showResultButtons = false;
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

    if (this.reference_number) {
      this.fetchDataAndPopulate(this.reference_number);
    }
  }

  private buildForm() {
    this.screeningForm = this.fb.group({
      unaidedDistanceVA_RE: ['', Validators.required],
      unaidedDistanceVA_LE: ['', Validators.required],
      unaidedNearVA_RE: ['NOT TEST', Validators.required], // Defaults to NO TEST if unaided
      unaidedNearVA_LE: ['NOT TEST', Validators.required], // Defaults to NO TEST if unaided
    });
  }

  private fetchDataAndPopulate(refNum: string) {
    this.apiService.getVisualAcuity(refNum).subscribe({
      next: (res: any) => {
        const d = res?.body ? res.body : res;
        if (d && (d.unaided_distance_va_re || d.unaided_distance_va_le)) {
          this.screeningForm.patchValue({
            unaidedDistanceVA_RE: d.unaided_distance_va_re || '',
            unaidedDistanceVA_LE: d.unaided_distance_va_le || '',
            unaidedNearVA_RE: d.unaided_near_va_re || 'NOT TEST',
            unaidedNearVA_LE: d.unaided_near_va_le || 'NOT TEST'
          });
          this.screeningForm.disable();
        } else {
          this.populateFromLocalStorage(refNum);
        }
      },
      error: () => {
        this.populateFromLocalStorage(refNum);
      }
    });
  }

private populateFromLocalStorage(refNum: string) {
  const localData = localStorage.getItem('latest_e_test_result');
  if (!localData) return;

  try {
    const testResult = JSON.parse(localData);
    if (testResult && testResult.reference_number === refNum) {
      const isAided = testResult.measurement_type === 'Aided';

      if (isAided) {
        // If test was Aided, patch into Aided fields (or present Aided values)
        this.screeningForm.patchValue({
          unaidedDistanceVA_RE: testResult.right_numeric_va || '',
          unaidedDistanceVA_LE: testResult.left_numeric_va || ''
        });
      } else {
        // If test was Unaided, patch into Unaided fields
        this.screeningForm.patchValue({
          unaidedDistanceVA_RE: testResult.right_numeric_va || '',
          unaidedDistanceVA_LE: testResult.left_numeric_va || ''
        });
      }

      this.screeningForm.get('unaidedDistanceVA_RE')?.markAsTouched();
      this.screeningForm.get('unaidedDistanceVA_LE')?.markAsTouched();
    }
  } catch (e) {
    console.error('Error parsing latest_e_test_result from localStorage', e);
  }
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
      this.fetchDataAndPopulate(this.reference_number);
    }
  }

  private markStepControlsAsTouched(step: number): void {
    const map: Record<number, string[]> = {
      1: ['unaidedDistanceVA_RE', 'unaidedDistanceVA_LE', 'unaidedNearVA_RE', 'unaidedNearVA_LE']
    };
    (map[step] || []).forEach(ctrl => this.screeningForm.get(ctrl)?.markAsTouched());
  }

  nextStep() {
    this.submitted = true;
    if (['unaidedDistanceVA_RE', 'unaidedDistanceVA_LE', 'unaidedNearVA_RE', 'unaidedNearVA_LE']
      .some(c => this.screeningForm.get(c)?.invalid)) {
      this.markStepControlsAsTouched(1);
      return;
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
    this.showResultButtons = true;
  }

onResultSelect(result: 'pass' | 'fail') {
  this.selectedResult = result;

  const localData = localStorage.getItem('latest_e_test_result');
  let isAidedTest = false;
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      isAidedTest = parsed.measurement_type === 'Aided';
    } catch (e) {
      console.error(e);
    }
  }

  const v = this.screeningForm.value;

  // Build payload dynamically based on Aided status
  const body: any = {
    reference_number: this.reference_number,
    measure_visual_acuity: true,
  };

  if (isAidedTest) {
    body.aided_distance_va_re = v.unaidedDistanceVA_RE;
    body.aided_distance_va_le = v.unaidedDistanceVA_LE;
    body.aided_near_va_re = v.unaidedNearVA_RE;
    body.aided_near_va_le = v.unaidedNearVA_LE;
  } else {
    body.unaided_distance_va_re = v.unaidedDistanceVA_RE;
    body.unaided_distance_va_le = v.unaidedDistanceVA_LE;
    body.unaided_near_va_re = v.unaidedNearVA_RE;
    body.unaided_near_va_le = v.unaidedNearVA_LE;
  }

  this.apiService.VisualAcuity(body).subscribe(
    (res: any) => {
      if (res.error === false) {
        localStorage.removeItem('latest_e_test_result');
        this.apiService.presentToast(res.message);
        this.apiService.isLoading.next(false);
        this.checkAlreadyDoVATEST(this.selectedResult);
      } else {
        this.apiService.presentToast(res.message, 'danger');
      }
    },
    () => this.apiService.presentToast('Something went wrong', 'danger')
  );
}

checkAlreadyDoVATEST(result: 'pass' | 'fail' | null) {
  console.log('=== [DEBUG] checkAlreadyDoVATEST Initiated ===');
  console.log('Input parameter `result`:', result);
  console.log('Class property `reference_number`:', this.reference_number);

  const localData = localStorage.getItem('latest_e_test_result');
  console.log('Raw localStorage [latest_e_test_result]:', localData);

  let isAidedTest = false;
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      isAidedTest = parsed.measurement_type === 'Aided';
    } catch (e) {
      console.error('Error parsing localStorage:', e);
    }
  }

  const body = { reference_number: this.reference_number };

  this.apiService.profile(body).subscribe({
    next: (res: any) => {
      console.log('API Response `/profile`:', res);

      // Helper function to strictly parse boolean-like fields from API
// Replace the existing isTruthy helper inside checkAlreadyDoVATEST() with this:
const isTruthy = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;

  if (typeof val === 'string') {
    const clean = val.trim().toLowerCase();

    // 1. Broad rejection of all non-wearing, past, absent, or negative states
    const isExplicitlyFalse = 
      clean === 'false' ||
      clean === '0' ||
      clean === 'no' ||
      clean === 'unaided' ||
      clean.includes('not wearing') ||
      clean.includes('no spectacles') ||
      clean.includes('does not wear') ||
      clean.includes('in the past') ||
      clean.includes('previously worn') ||
      clean.includes('no longer') ||
      clean.includes('never');

    if (isExplicitlyFalse) return false;

    // 2. Strict check for active spectacle usage
    return (
      clean === 'true' ||
      clean === '1' ||
      clean === 'yes' ||
      clean === 'aided' ||
      clean.includes('currently wearing')
    );
  }

  return false;
};

      // Sanitize profile inputs
      const profileWearsGlasses = isTruthy(res?.wears_spectacles) || isTruthy(res?.has_glasses);
      const wearsSpectacles = profileWearsGlasses || isAidedTest;

      console.log('Sanitized wearsSpectacles Check:', {
        profileWearsGlasses,
        isAidedTest,
        final_wearsSpectacles: wearsSpectacles,
        raw_wears_spectacles: res?.wears_spectacles,
        raw_has_glasses: res?.has_glasses
      });

      // Route 1: Already completed second screening
      if (res?.second_screening === true || res?.second_screening === 1) {
        console.log('-> Navigating to: /layout/secoundScreening');
        this.router.navigate(['/layout/secoundScreening']);
        return;
      }

      // Route 2: Test Failed
      if ((res?.second_screening === false || res?.second_screening === 0 || !res?.second_screening) && result === 'fail') {
        if (wearsSpectacles) {
          console.log('-> Navigating to: /layout/refraction-spectacle-presentation');
          this.router.navigate(['/layout/refraction-spectacle-presentation'], {
            queryParams: { reference_number: this.reference_number }
          });
        } else {
          console.log('-> Navigating to: /layout/refraction');
          this.router.navigate(['/layout/refraction'], {
            queryParams: { reference_number: this.reference_number }
          });
        }
        return;
      }

      // Route 3: Test Passed / Fallback
      console.log('-> Navigating to: /layout/first-screening');
      this.router.navigate(['/layout/first-screening'], {
        queryParams: { reference_number: this.reference_number }
      });
    },
    error: (err) => {
      console.error('API Error in checkAlreadyDoVATEST:', err);
    }
  });
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