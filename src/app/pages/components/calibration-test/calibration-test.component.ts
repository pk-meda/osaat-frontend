import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DevicePpi } from 'device-ppi';
import { IonModal } from '@ionic/angular/standalone';

@Component({
  selector: 'app-calibration-test',
  templateUrl: './calibration-test.component.html',
  styleUrls: ['./calibration-test.component.scss'],
  standalone: false
})
export class CalibrationTestComponent {
  @Input() modal!: IonModal;
  @Output() dismissChange:EventEmitter<boolean> = new EventEmitter();
  ppiVal:number|undefined;
  desiredImgHeight:number = 40;
  userEnteredHeight:string = '';
  errorMsg:string = '';

  constructor() {
    this.getDevicePpi();
  }

  async getDevicePpi() {
    const ppi = await DevicePpi.getPPI();
    this.ppiVal = ppi.xdpi || ppi.ppi || 160; 
    console.log(JSON.stringify(ppi),'=====ppi val from plugin===');
  }

  get imageStyle(){
    const dpi = this.ppiVal || 160;
    const pxRequired = (this.desiredImgHeight * dpi) / 25.4;
    const cssPixels = pxRequired / window.devicePixelRatio;
    return `width: ${cssPixels}px; height: ${cssPixels}px;`;
  }

  validateHeight(maxValue = 50) {
    const inputValue = this.userEnteredHeight;
    const wholeNumberRegex = /^[0-9]*$/;

    if (wholeNumberRegex.test(inputValue)) {
      if (inputValue === '') {
        this.userEnteredHeight = '';
        this.errorMsg = 'Incorrect height. Please measure again.';
        return;
      }

      const numValue = parseInt(inputValue, 10);
      const minValue = 1;

      if (numValue >= minValue && numValue <= maxValue) {
        this.userEnteredHeight = inputValue
      } else if (numValue < minValue) {
        this.userEnteredHeight = String(minValue);
      } else if (numValue > maxValue && maxValue != Infinity) {
        this.userEnteredHeight = String(maxValue);
      }

      if(Number(this.userEnteredHeight) == this.desiredImgHeight) this.dismissChange.emit(true);
      else this.errorMsg = 'Incorrect height. Please measure again.';
    }
    else{
      this.userEnteredHeight = '';
      this.errorMsg = 'Incorrect height. Please measure again.';
    }
  }
}
