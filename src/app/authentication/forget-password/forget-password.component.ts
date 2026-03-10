import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
  standalone: false
})
export class ForgetPasswordComponent implements OnInit {
  email: string = '';
  EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  isLoading: boolean = false;

  constructor(
    private navtCtrl: NavController,
    private apiService: ApiService,
    private router: ActivatedRoute) {
    this.router.paramMap.subscribe((res: any) => {
    })
  }

  ngOnInit() { }

  submit() {
    if (this.EMAIL_PATTERN.test(this.email)) {
      let data = {
        "email": this.email
      }
      // this.apiService.forgotPassword(data).subscribe({
      //   next: (res: any) => {
      //     this.loading = false;
      //     if (res.status == true) {
      //       this.apiService.presentToast(res.message);
      //       this.loading = false;
      this.isLoading = true
      this.apiService.sendOtp({ email: this.email }).subscribe(async res => {
       await this.apiService.presentToast(res.message);
       if(res){
        this.isLoading = false
         this.navtCtrl.navigateForward(['/authentication/verify-otp'], {
           queryParams: { email: this.email },
         });
       }
      });
      //     } else {
      //       this.apiService.presentToast(res.message, 'danger');
      //       this.loading = false;
      //     }
      //   },
      //   error: (error) => {
      //     this.loading = false;
      //     this.apiService.handleError(error);
      //   }
      // });
    }
  }
}
