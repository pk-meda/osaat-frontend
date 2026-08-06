// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntlTelInputDirective } from './intl-tel-input.directive';
import { ContactNumberOnlyDirective } from './contact-number.directive';
import { IonicModule } from '@ionic/angular';
import { StationStepperComponent } from '../components/station-stepper/station-stepper.component';
@NgModule({
  declarations: [IntlTelInputDirective,
    ContactNumberOnlyDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StationStepperComponent
  ],
  exports: [
    ContactNumberOnlyDirective,
    IntlTelInputDirective,
    CommonModule,
    FormsModule,
    StationStepperComponent
  ]
})
export class SharedModule {}

