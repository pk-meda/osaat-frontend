import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { MustMatch } from 'src/app/helpers/must-match.validator';
import { markAllDirty } from 'src/app/helpers/utils';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-create-new-password',
  templateUrl: './create-new-password.component.html',
  styleUrls: ['./create-new-password.component.scss'],
  standalone: false
})
export class CreateNewPasswordComponent implements OnInit {
  passwordForm: FormGroup = new FormGroup({});
  showPassword: boolean = false;
  showconfirmPassword: boolean = false;
  userEmail: any;
  isLoading:boolean = false
  constructor(private fb: FormBuilder,
    private apiService:ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.queryParamMap.subscribe((res: any) => {
      if(res.params.email){
        this.userEmail = res.params.email;
      }
    });

    this.initForm();
  }

  ngOnInit() { }

  initForm() {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!$@%])[A-Za-z\d!$@%]+$/)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: [MustMatch('password', 'confirmPassword')]
    });
  }

  get f() {
    return this.passwordForm.controls;
  }

  submit() {
    markAllDirty(this.passwordForm);
    if (this.passwordForm.invalid) {
      return;
    }
    let data = this.passwordForm.value;
    this.isLoading=true
    this.apiService.passwordReset({email:this.userEmail,new_password:this.passwordForm.get('password')?.value}).subscribe({
      next: (res: any) => {
        if (res.error == false) {
          this.apiService.presentToast(res.message);
          this.isLoading=false
          this.router.navigate(['/authentication/login'])
        } else {
          this.isLoading=false
          this.apiService.presentToast(res.message, 'danger');
        }
      },
      error: (error) => {
        this.isLoading=false
        this.apiService.handleError(error);
      }
    });

  }
}