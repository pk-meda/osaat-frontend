import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { markAllDirty } from 'src/app/helpers/utils';
import { MustMatch } from 'src/app/helpers/must-match.validator';
import { ApiService } from 'src/app/services/api.service';
import { AuthenticationService } from 'src/app/helpers/auth/authentication.service';
import { NavController ,ModalController } from '@ionic/angular';
import { VerifyOtpComponent } from '../verify-otp/verify-otp.component';
import { Route, Router } from '@angular/router';
import * as intlTelInput from 'intl-tel-input';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent implements OnInit,AfterViewInit {
  registerForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  showconfirmPassword: boolean = false;
  isLoading: boolean = false;
  isPhoneValid:boolean = false;
  iti: any;

  constructor(private fb: FormBuilder,private apiService: ApiService,
        private authService: AuthenticationService,
        private navtCtrl: NavController,
        private modalController: ModalController,
        private router: Router,
        private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit() { }

  initForm() {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        mobile_number: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required,Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!$@%])[A-Za-z\d!$@%]+$/)]],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, Validators.requiredTrue] 
      },
      {
        validators: [MustMatch('password', 'confirmPassword')] // Add the custom validator here
      }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

    ngAfterViewInit() {
      const input = document.querySelector<HTMLInputElement>( '#phoneInput' );
  
      if ( input ) {
        this.iti = intlTelInput( input, {
          initialCountry: 'auto',
          separateDialCode: true,
           nationalMode: true,
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.15/build/js/utils.js',
          geoIpLookup: ( callback ) => {
            fetch( 'https://ipapi.co/json' )
              .then( ( res ) => res.json() )
              .then( ( data ) => callback( data.country_code ) )
              .catch( () => callback( 'us' ) );
          },
        } );
  
        // Listen for changes
        input.addEventListener( 'input', () => this.updatePhoneNumber() );
        input.addEventListener( 'countrychange', () => this.updatePhoneNumber() );
      }
    }

updatePhoneNumber() {
  if (this.iti) {
    const fullNumber = this.iti.getNumber(); // full intl number with country code
    const isValid = this.iti.isValidNumber();
    this.isPhoneValid = isValid;

    // Save only to form, don't overwrite the visible input value
    this.registerForm.get('mobile_number')?.setValue(fullNumber, { emitEvent: false });

    if (!isValid) {
      this.registerForm.get('mobile_number')?.setErrors({ invalidPhone: true });
    } else {
      this.registerForm.get('mobile_number')?.setErrors(null);
    }
    this.cdr.detectChanges();
  }
}


  onPhoneValidityChange(isValid: any) {
    this.isPhoneValid = isValid;
    const phoneControl = this.registerForm.get('mobile_number');
    if (phoneControl?.value && !isValid) {
      phoneControl.setErrors({ 'invalidPhone': true });
    } else if (phoneControl?.hasError('invalidPhone')) {
      phoneControl.setErrors(null);
      phoneControl.updateValueAndValidity();
    }
  }
  
phoneInvalid() {
  return this.f['mobile_number'].dirty &&
    (this.f['mobile_number'].invalid || !this.isPhoneValid);
}

  submit() {
    markAllDirty(this.registerForm);
    if (this.registerForm.invalid || !this.isPhoneValid) {
      return;
    }
    if(this.registerForm.value.agreeToTerms == false){
      return;
    }
    this.isLoading = true;
    let data = {
      name  :this.registerForm.value.name,
      mobile_number :  this.registerForm.value.mobile_number,
      email :this.registerForm.value.email,
      password :this.registerForm.value.password,
    }
    this.apiService.register(data).subscribe({
      next: (res: any) => {
        if(res.error == false){
          this.apiService.sendOtp({ email: this.registerForm.value.email }).subscribe(async res => {
            if(res.error == false){
             await this.apiService.presentToast(res.message);
             await this.presentModal(res);
            }
            this.isLoading = false;   
          });
        }else{
          this.apiService.presentToast(res.message,'danger')
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.apiService.handleError(error);
      }
    });
  }

  processUserData(data:any, msg:any){    
    const userData = {
      token: data.access_token,
      id: data.user_id,
    };
    this.authService.setLogin(userData);
    this.apiService.presentToast(msg);
    this.navtCtrl.navigateRoot(['/member'], { replaceUrl: true });
  }

  async presentModal(userData:any) {
    const modal = await this.modalController.create({
      component: VerifyOtpComponent,
      cssClass: 'my-custom-class fullscreen',
      backdropDismiss: false,
      componentProps: { userEmail: this.registerForm.value['email'] }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if(data) this.processUserData(userData, 'Login Successful')
  }
}
