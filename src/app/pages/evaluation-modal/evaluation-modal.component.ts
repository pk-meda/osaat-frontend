import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-modal',
  templateUrl: './evaluation-modal.component.html',
  styleUrls: ['./evaluation-modal.component.scss'],
  standalone: false,
})
export class EvaluationModalComponent {
  selectedOption: any;

  @Input() screeningType!: string;
  @Input() leftEyeDone: boolean = false;
  @Input() rightEyeDone: boolean = false;
  @Input() passRate?: { left: number; right: number } = { left: 0, right: 0 };

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private router: Router
  ) {}

  selectOption(opt: 'LEFT' | 'RIGHT' | 'BOTH' | 'pass' | 'fail' | 'retest' | 'exit') {
    const payload: any = {};
    if (opt === 'LEFT' || opt === 'RIGHT' || opt === 'BOTH') {
      payload.eye = opt;
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
