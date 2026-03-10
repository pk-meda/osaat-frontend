// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IntlTelInputDirective } from './intl-tel-input.directive';
import { ContactNumberOnlyDirective } from './contact-number.directive';
@NgModule({
  declarations: [IntlTelInputDirective,
    ContactNumberOnlyDirective,
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ContactNumberOnlyDirective,
    IntlTelInputDirective,
    CommonModule,
    FormsModule
  ]
})
export class SharedModule {}

