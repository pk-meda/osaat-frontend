import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, ViewWillEnter } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { EvaluationModalComponent } from '../../evaluation-modal/evaluation-modal.component';
import { DevicePpi } from 'device-ppi'
import { EyeConditionsModalComponent } from '../../eye-condition-modal/eye-conditions-modal/eye-conditions-modal.component';

type Eye = 'left' | 'right';
type Dir = 'up' | 'down' | 'left' | 'right';

@Component( {
  selector: 'app-comprehensive-eye-exam',
  templateUrl: './comprehensive-eye-exam.component.html',
  styleUrls: [ './comprehensive-eye-exam.component.scss' ],
  standalone: false
} )
export class ComprehensiveEyeExamComponent implements OnInit {
  // Labels correspond to your PNG names
  snellenLabels: string[] = ['43-5', '26-5', '17-5', '13-5', '9', '6-5', '5-5', '4-5', '3-5'];
  snellenSizes: number[] = [43.5, 26.5, 17.5, 13.5, 9, 6.5, 5.5, 4.5, 3.5];

  currentStep = 1;
  totalSteps = this.snellenSizes.length;

  rotations: number[] = [];
  currentRotation = 0;
  expectedDirection: Dir = 'up';

  currentEye: Eye = 'left';
  bothMode = false;
  private eyeHadFailure: Record<Eye, boolean> = { left: false, right: false };
  private eyeResults: Record<Eye, boolean> = { left: false, right: false };
  leftEyeDone = false;
  rightEyeDone = false;

  reference_number: string | null = null;
  ppiVal: number | undefined = 0;
  testResults: Record<Eye, Record<string, boolean>> = {
    left: {},
    right: {},
  };

  // Add these class properties to track parameters
testingDistance: number = 3; // default standard of 3 meters
isAided: boolean = false;    // false = Unaided (without spectacles), true = Aided (with spectacles)

  private startX = 0;
  private startY = 0;
  private readonly threshold = 30;
  presentingElement!: HTMLElement | null;
  // canDismiss: boolean = false;
  // private canDismissOverride: boolean = false;
  // isModalOpen:boolean = false;

// Inside comprehensive-eye-exam.component.ts

constructor(
  public apiService: ApiService,
  private router: Router,
  private route: ActivatedRoute,
  private modalController: ModalController
) {
  this.totalSteps = this.snellenSizes.length;
}

ngOnInit() {
  this.presentingElement = document.querySelector('.ion-page');
  
  // Use paramMap instead of queryParamMap for path parameters
  this.route.paramMap.subscribe((params) => {
    const ref = params.get('reference_number');
    
    if (ref) {
      this.reference_number = ref;
      // Initialize without opening the modal
      this.askWhichEye(); 
      this.buildTest();
    } else {
      // Fallback: check if it was perhaps passed as a query param (for flexibility)
      const queryRef = this.route.snapshot.queryParamMap.get('reference_number');
      if (queryRef) {
          this.reference_number = queryRef;
          this.askWhichEye();
          this.buildTest();
      } else {
          this.openModal();
      }
    }
  });

  DevicePpi.getPPI().then(ppi => {
    this.ppiVal = ppi.xdpi || ppi.ppi || 160;
  });
}
  // —————————————— UI / Flow ——————————————

  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      this.handleUser(selectedUser);
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }

  handleUser(user: any) {
    this.reference_number = user?.reference_number ?? null;
    this.askWhichEye();
    this.buildTest();
  }

private async askWhichEye() {
  const modal = await this.modalController.create({
    component: EvaluationModalComponent,
   componentProps: { // 👈 It goes right here!
      screeningType: 'SELECT EYE TEST',
      leftEyeDone: this.leftEyeDone,
      rightEyeDone: this.rightEyeDone,
      testingDistance: this.testingDistance, // Passes class property down
      isAided: this.isAided                  // Passes class property down
    },
  });
  await modal.present();
  const { data } = await modal.onDidDismiss();

  const sel = data?.eye as 'LEFT' | 'RIGHT' | 'BOTH' | undefined;
  
  // Capture the manual selections made by the clinician inside the modal
  if (data?.testingDistance) this.testingDistance = data.testingDistance;
  if (data?.isAided !== undefined) this.isAided = data.isAided;

  if (sel === 'BOTH') {
    this.bothMode = true;
    this.currentEye = !this.leftEyeDone ? 'left' : 'right';
    this.restartEyeTest();
    return;
  }

  this.bothMode = false;
  this.currentEye = sel === 'RIGHT' ? 'right' : 'left';
  this.restartEyeTest();
}

  backLocation() {
    this.router.navigate(['/layout/profile']);
  }

  // —————————————— Test Engine ——————————————

private buildTest() {
  this.rotations = [];
  let prev: number | null = null;
  this.snellenSizes.forEach(() => {
    let next: number;
    do {
      next = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
    } while (next === prev);  
    this.rotations.push(next);
    prev = next;
  });
  this.updateCurrent();
}

  private updateCurrent() {
    this.currentRotation = this.rotations[ this.currentStep - 1 ];
  }

  getImagePath(): string {
    return `assets/images/${ this.snellenLabels[ this.currentStep - 1 ] }.png`;
  }

    get imageStyleWidth(): string {
  const dpi = this.ppiVal || 160;
  const desiredMm = Number(this.snellenSizes[this.currentStep - 1]) || 43.5;
  const pxRequired = (desiredMm * dpi) / 25.4;
  const cssPixels = pxRequired / window.devicePixelRatio;
  return `${cssPixels}px`;
}

  get imageStyle() {
    const dpi = this.ppiVal || 160;
    const desiredMm = Number( this.snellenSizes[ this.currentStep - 1 ] ) || 43.5;
    const pxRequired = ( desiredMm * dpi ) / 25.4;  // hardware pixels required
    const cssPixels = pxRequired / window.devicePixelRatio; // convert to CSS pixels
    return `width: ${cssPixels}px; height: ${cssPixels}px;`;
  }


  // —————————————— Touch Handling ——————————————

  onTouchStart(evt: TouchEvent) {
    evt.preventDefault();
    this.startX = evt.touches[0].clientX;
    this.startY = evt.touches[0].clientY;
  }

async onTouchEnd(evt: TouchEvent) {
  evt.preventDefault();

  const endX = evt.changedTouches[ 0 ].clientX;
  const endY = evt.changedTouches[ 0 ].clientY;
  const diffX = endX - this.startX;
  const diffY = endY - this.startY;
  const dx = Math.abs( diffX ), dy = Math.abs( diffY );

  const TH = this.threshold;
  let swipe: Dir | '' = '';
  if ( dx > TH && dx > dy + 10 ) {
    swipe = diffX > 0 ? 'right' : 'left';
  } else if ( dy > TH && dy > dx + 10 ) {
    swipe = diffY > 0 ? 'down' : 'up';
  } else {
    // too small or too diagonal—ignore
    return;
  }

  const dirMap: Record<number, Dir> = {
    0: 'right',
    90: 'down',
    180: 'left',
    270: 'up',
  };
  this.expectedDirection = dirMap[this.currentRotation];

  const testIdx = this.snellenLabels[this.currentStep - 1];

  if (swipe === this.expectedDirection) {
    this.testResults[this.currentEye][testIdx] = true;
    await this.nextStep();
  } else if (this.currentStep - 1 <= 4) {
    // ✅ FIX: Mark the early failure, track it, and call nextStep() instead of exiting!
    this.testResults[this.currentEye][testIdx] = false;
    this.eyeHadFailure[this.currentEye] = true; 
    await this.nextStep(); 
  } else {
    // late failure → mark and continue
    this.testResults[this.currentEye][testIdx] = false;
    this.eyeHadFailure[this.currentEye] = true;
    await this.nextStep();
  }
}

  private async nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateCurrent();
      return;
    }

    // finalize this eye
    this.eyeResults[this.currentEye] = !this.eyeHadFailure[this.currentEye];
    if (this.currentEye === 'left') this.leftEyeDone = true;
    else this.rightEyeDone = true;

    // BOTH mode: automatically run the other eye without opening the modal again
    if (this.bothMode) {
      if (!this.leftEyeDone) {
        this.currentEye = 'left';
        this.restartEyeTest();
        return;
      }
      if (!this.rightEyeDone) {
        this.currentEye = 'right';
        this.restartEyeTest();
        return;
      }
      await this.showFinal();
      return;
    }

    // Single-eye mode: ask which eye next (if any), else finish
    if (!this.leftEyeDone || !this.rightEyeDone) {
      await this.askWhichEye();
    } else {
      await this.showFinal();
    }
  }

public async showFinal() {
const percentage = this.calculatePercentage(this.testResults);
  const rate = this.getPassRate(percentage);
  // 1. Mark both eyes as done to force the HTML template to show the Summary Card
  this.leftEyeDone = true;
  this.rightEyeDone = true;

  // 2. Save the correct overall result status to session storage
  if (rate.left && rate.right) {
    sessionStorage.setItem('eyeExam', 'yes');
  } else {
    sessionStorage.setItem('eyeExam', 'no');
  }
    /*const percentage = this.calculatePercentage(this.testResults);
    const rate = this.getPassRate(percentage);

    if (rate.left && rate.right) {
      sessionStorage.setItem('eyeExam', 'yes');
      return this.submit({ eye: 'yes' });
    }

    sessionStorage.setItem('eyeExam', 'no');
    
    // THIS is where that code remains! 
    
    const modal = await this.modalController.create({
      component: EvaluationModalComponent,
      componentProps: {
        screeningType: 'Test Failed. Retest or exit?',
        passRate: percentage,
        
        // Pass these variables so they are preserved if the clinician modifies them or decides to retest!
        testingDistance: this.testingDistance,
        isAided: this.isAided
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.option === 'retest') {
      // Full reset of states
      this.testResults = { left: {}, right: {} };
      this.leftEyeDone = this.rightEyeDone = false;
      this.eyeHadFailure = { left: false, right: false };
      this.eyeResults = { left: false, right: false };
      this.currentStep = 1;
      this.buildTest();
      await this.askWhichEye();
    } else {
      await this.submit({ eye: 'no' });
    }*/
  }

  public async showOptionsModal() {
  const percentage = this.calculatePercentage(this.testResults);

  const modal = await this.modalController.create({
    component: EvaluationModalComponent,
    componentProps: {
      screeningType: 'Test Failed. Retest or exit?',
      passRate: percentage,
      testingDistance: this.testingDistance,
      isAided: this.isAided
    },
  });
  
  await modal.present();
  const { data } = await modal.onDidDismiss();

  if (data?.option === 'retest') {
    // Reset all states and restart
    this.testResults = { left: {}, right: {} };
    this.leftEyeDone = false;
    this.rightEyeDone = false;
    this.eyeHadFailure = { left: false, right: false };
    this.eyeResults = { left: false, right: false };
    this.currentStep = 1;
    this.buildTest();
    await this.askWhichEye();
  } else if (data?.option === 'exit') {
    // Exit and save progress as a failure
    await this.submit({ eye: 'no' });
  }
}

  private getPassRate(percentage: { left: number; right: number }) {
    const passStatus = { left: false, right: false };
    if (percentage.left > 55) passStatus.left = true;
    if (percentage.right > 55) passStatus.right = true;
    return passStatus;
  }

  public calculatePercentage(data: Record<Eye, Record<string, boolean>>) {
    const result = { left: 0, right: 0 };
    for (const key in data.left) if (data.left[key]) result.left += 11.11;
    for (const key in data.right) if (data.right[key]) result.right += 11.11;

    return {
      left: result.left ? Math.round(result.left) : 0,
      right: result.right ? Math.round(result.right) : 0,
    };
  }

  private restartEyeTest() {
    this.currentStep = 1;
    this.buildTest();
  }

  // Standard Snellen fraction labels corresponding to steps 1-9
private visualAcuityMap: Record<number, string> = {
  1: '6/60', // Step 1 (43.5mm)
  2: '6/36', // Step 2 (26.5mm)
  3: '6/24', // Step 3 (17.5mm)
  4: '6/18', // Step 4 (13.5mm)
  5: '6/12', // Step 5 (9.0mm)
  6: '6/9',  // Step 6 (6.5mm)
  7: '6/7.5',// Step 7 (5.5mm)
  8: '6/6',  // Step 8 (4.5mm)
  9: '6/5'   // Step 9 (3.5mm)
};

// Find this in comprehensive-eye-exam.component.ts and change "private" to "public"
public getNumericVisualAcuity(eye: Eye): string {
  const results = this.testResults[eye];
  let highestPassedStep = 0;

  for (let i = 0; i < this.snellenLabels.length; i++) {
    const label = this.snellenLabels[i];
    if (results[label] === true) {
      highestPassedStep = i + 1;
    }
  }

  return this.visualAcuityMap[highestPassedStep] || 'Less than 6/60';
}

  // —————————————— API ——————————————

  public async submit(data: { eye: string }) {
  const leftPassRate = this.calculatePercentage(this.testResults).left;
  const rightPassRate = this.calculatePercentage(this.testResults).right;

  const payload = {
    reference_number: this.reference_number,
    status: data.eye === 'yes' ? 'Yes' : 'No',
    
    // Captured Parameters
    testing_distance_meters: this.testingDistance,
    measurement_type: this.isAided ? 'Aided' : 'Unaided', // Spectacles vs No Spectacles
    
    // Left Eye Results
    left_eye_tested: this.leftEyeDone,
    left_pass_fail: leftPassRate > 55 ? 'Pass' : 'Fail',
    left_numeric_va: this.getNumericVisualAcuity('left'),
    left_eye_score: leftPassRate,

    // Right Eye Results
    right_eye_tested: this.rightEyeDone,
    right_pass_fail: rightPassRate > 55 ? 'Pass' : 'Fail',
    right_numeric_va: this.getNumericVisualAcuity('right'),
    right_eye_score: rightPassRate, 
  };

  this.apiService.isLoading.next(true);
  this.apiService.comprehensive_eye_exam(payload).subscribe(
    (res) => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast(res.message);
      if (data.eye === 'no') {
        this.router.navigate(['/layout/secoundScreening'], {
          queryParams: { reference_number: this.reference_number },
        });
      } else {
        this.checkAlreadyDoVATEST();
      }
    },
    (err) => {
      this.apiService.isLoading.next(false);
      this.apiService.presentToast(err.error.message, 'danger');
    }
  );
}

    checkAlreadyDoVATESTNew(){
        let body ={
      reference_number:this.reference_number
    }
    this.apiService.profile(body).subscribe((res:any)=>{
      const data = res;
      // if(data.measure_visual_acuity == true){
        this.router.navigate(['/layout/first-screening'], {
            queryParams: { reference_number: this.reference_number },
        });
      // }else{
        // this.router.navigate( [ '/layout/measurement-visual' ], { queryParams: { reference_number: this.reference_number }, } );
      // }
    })
  }

  checkAlreadyDoVATEST(){
        let body ={
      reference_number:this.reference_number
    }
    this.apiService.profile(body).subscribe((res:any)=>{
      const data = res;
      // if(data.measure_visual_acuity == true){
        this.router.navigate(['/layout/first-screening'], {
            queryParams: { reference_number: this.reference_number },
        });
      // }else{
        // this.router.navigate( [ '/layout/measurement-visual' ], { queryParams: { reference_number: this.reference_number }, } );
      // }
    })
  }

  async modalOpen() {
    const modal = await this.modalController.create({
      component: EyeConditionsModalComponent,
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.result === 'Passed') {
      this.router.navigate(['/layout/first-screening']);
    } else {
      this.router.navigate(['/layout/secoundScreening'], {
        queryParams: { reference_number: this.reference_number },
      });
    }
  }
}
