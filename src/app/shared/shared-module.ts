// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { StationStepperComponent } from '../components/station-stepper/station-stepper.component';

@NgModule({
  declarations: [
    StationStepperComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    StationStepperComponent // <--- VERY IMPORTANT
  ]
})
export class SharedModule { }