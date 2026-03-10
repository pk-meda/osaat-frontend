import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/helpers/auth/authentication.service';
import { markAllDirty } from 'src/app/helpers/utils';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  logging: boolean = false;
  isLoading:boolean=false;
  constructor(private fb: FormBuilder,
    private authService: AuthenticationService,
    private navtCtrl: NavController,
    private apiService: ApiService) {
    this.initForm();
  }

  ngOnInit() { }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  submit() {
    markAllDirty(this.loginForm);
    if (this.loginForm.invalid) {
      return;
    }
    this.logging = true;
    this.isLoading= true
    let data = this.loginForm.value;
    this.apiService.login(data).subscribe({
      next: (res: any) => {
        this.logging = false;
        if (res.error == false) {
          const userData = {
            token: res.body.token,
            // user_id: res.user_id,
          };
          localStorage.setItem('userDetails',JSON.stringify(res.body.user))
          console.log(res,'data')
          this.authService.setLogin(userData);
          this.apiService.presentToast(res.message);
          this.isLoading= false
          this.navtCtrl.navigateRoot(['/layout'], { replaceUrl: true });
        } else {
          this.isLoading= false
          this.apiService.presentToast(res.message, 'danger');
        }
      },
      error: (error: any) => {
        this.logging = false;
        this.isLoading= false
        this.apiService.handleError(error);
      }
    });

  }
  localstorage(){
    localStorage.setItem('login', 'login');
  }
}

