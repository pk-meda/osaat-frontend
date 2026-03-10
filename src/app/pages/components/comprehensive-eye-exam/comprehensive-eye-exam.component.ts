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

  private startX = 0;
  private startY = 0;
  private readonly threshold = 30;
  presentingElement!: HTMLElement | null;
  // canDismiss: boolean = false;
  // private canDismissOverride: boolean = false;
  // isModalOpen:boolean = false;

  constructor(
    public apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private modalController: ModalController
  ) {
    this.totalSteps = this.snellenSizes.length;

    this.route.queryParamMap.subscribe((params) => {
      this.reference_number = params.get('reference_number');
      if (this.reference_number === null) {
        this.openModal();
      } else {
        // If reference exists, go straight to eye selection
        this.askWhichEye();
        this.buildTest();
      }
    });
  }
  async ngOnInit() {
    this.presentingElement = document.querySelector('.ion-page');
    const ppi = await DevicePpi.getPPI();
    this.ppiVal = ppi.xdpi || ppi.ppi || 160;
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
      componentProps: {
        screeningType: 'SELECT EYE TEST',
        leftEyeDone: this.leftEyeDone,
        rightEyeDone: this.rightEyeDone,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();

    const sel = data?.eye as 'LEFT' | 'RIGHT' | 'BOTH' | undefined;

    if (sel === 'BOTH') {
      this.bothMode = true;
      // start with whichever eye is not done yet
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
      // early failure → stop and show final
      this.testResults[this.currentEye][testIdx] = false;
      await this.showFinal();
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

  private async showFinal() {
    const percentage = this.calculatePercentage(this.testResults);
    const rate = this.getPassRate(percentage);

    if (rate.left && rate.right) {
      sessionStorage.setItem('eyeExam', 'yes');
      return this.submit({ eye: 'yes' });
    }

    sessionStorage.setItem('eyeExam', 'no');
    const modal = await this.modalController.create({
      component: EvaluationModalComponent,
      componentProps: {
        screeningType: 'Test Failed. Retest or exit?',
        passRate: percentage,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.option === 'retest') {
      // full reset
      this.testResults = { left: {}, right: {} };
      this.leftEyeDone = this.rightEyeDone = false;
      this.eyeHadFailure = { left: false, right: false };
      this.eyeResults = { left: false, right: false };
      this.currentStep = 1;
      this.buildTest();
      await this.askWhichEye();
    } else {
      await this.submit( { eye: 'no' } );
    }
  }

  private getPassRate(percentage: { left: number; right: number }) {
    const passStatus = { left: false, right: false };
    if (percentage.left > 55) passStatus.left = true;
    if (percentage.right > 55) passStatus.right = true;
    return passStatus;
  }

  private calculatePercentage(data: Record<Eye, Record<string, boolean>>) {
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

  // —————————————— API ——————————————

  private async submit(data: { eye: string }) {
    const payload = {
      status: data.eye === 'yes' ? 'Yes' : 'No',
      reference_number: this.reference_number,
    };

    this.apiService.isLoading.next(true);
    this.apiService.comprehensive_eye_exam(payload).subscribe(
      (res) => {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast(res.message);
        if (data.eye === 'no') {
          this.router.navigate(['/layout/secoundScreening'], {
            queryParams: { reference_number: this.reference_number },
        })
        } else {
         this.checkAlreadyDoVATEST()
          // this.modalOpen();
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
        this.router.navigate(['/layout/complaint'], {
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
        this.router.navigate(['/layout/complaint'], {
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
