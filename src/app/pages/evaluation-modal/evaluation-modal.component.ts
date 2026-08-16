import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular'; // 1. Added ToastController
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
  standalone: false,
})
export class EvaluationModalComponent implements OnInit {
  selectedOption: any;

  @Input() screeningType!: string;
  @Input() leftEyeDone: boolean = false;
  @Input() rightEyeDone: boolean = false;
  @Input() passRate?: { left: number; right: number } = { left: 0, right: 0 };

  // New Inputs received from the parent component
  @Input() testingDistance: number = 3;
  @Input() isAided: boolean = false;

  // Property to bind to the UI segment switch ('aided' or 'unaided')
  spectaclesStatus: 'aided' | 'unaided' = 'unaided';

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController, // 2. Injected ToastController
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // Sync the initial spectacles segment selection with the parent's boolean state
    this.spectaclesStatus = this.isAided ? 'aided' : 'unaided';
  }

  // Handle segment switch updates from the template
  onSpectaclesChange(event: any) {
    this.isAided = event.detail.value === 'aided';
  }

  // 3. New interceptor method to show warning toast before selecting eye
  async confirmPreTestInstructions(eyeOption: 'LEFT' | 'RIGHT' | 'BOTH') {
    const toast = await this.toastController.create({
      header: '⚠️ PRE-TEST CHECKLIST',
      message: '1. Please rotate this device to LANDSCAPE mode.\n\n2. Ensure the testing distance is exactly 3 METRES.',
      position: 'middle',
      color: 'warning',
      cssClass: 'pre-test-warning-toast',
      buttons: [
        {
          text: 'SKIP',
          role: 'cancel',
          handler: () => {
            // Dismiss toast and execute original selection payload logic
            this.selectOption(eyeOption);
          }
        }
      ]
    });

    await toast.present();
  }

  selectOption(opt: 'LEFT' | 'RIGHT' | 'BOTH' | 'pass' | 'fail' | 'retest' | 'exit') {
    const payload: any = {};
    
    if (opt === 'LEFT' || opt === 'RIGHT' || opt === 'BOTH') {
      payload.eye = opt;
      // Send the configured clinical parameters back to the parent component
      payload.testingDistance = this.testingDistance;
      payload.isAided = this.isAided;
    } else {
      payload.option = opt;
    }
    
    if (this.passRate != null) {
      payload.passRate = this.passRate;
    }
    
    this.modalCtrl.dismiss(payload);
  }

  dismissModal() {
    this.modalCtrl.dismiss({ result: this.selectedOption });
  }

  backLocation() {
    this.modalCtrl.dismiss();
    this.router.navigate(['/layout/profile']);
  }
}