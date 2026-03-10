import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthenticationPageRoutingModule } from './authentication-routing.module';

import { AuthenticationPage } from './authentication.page';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { VerifyOtpComponent } from './verify-otp/verify-otp.component';
import { CreateNewPasswordComponent } from './create-new-password/create-new-password.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { SharedModule } from '../helpers/shared.module';
import { ContactNumberOnlyDirective } from '../helpers/contact-number.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    AuthenticationPageRoutingModule,
    SharedModule  
  ],
  declarations: [
    AuthenticationPage,
    WelcomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    VerifyOtpComponent,
    CreateNewPasswordComponent,
  ],
  exports:[SharedModule]
})
export class AuthenticationPageModule {}
