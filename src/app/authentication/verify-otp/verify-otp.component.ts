import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController ,ModalController} from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
  standalone: false

})
export class VerifyOtpComponent  implements OnInit {
  @Input() userEmail!:string;
  processing:boolean = false;
  isLoading:boolean=false;
  userOtp:any;
  err:string = '';
  otpConfig = {
    length: 6,
    inputClass: 'otp-input',
    containerClass: 'otp-container',
    allowNumbersOnly: true
  };
  location: any;
  constructor(private navtCtrl: NavController,
    private apiService: ApiService,
    private modalController: ModalController,
    private routerNevigate:Router,
    private router: ActivatedRoute) {
      console.log(this.location,'new')
      this.router.queryParamMap.subscribe((res: any) => {
        if(res.params.email){
          this.userEmail = res.params.email;
        }
      })

     this.location= localStorage.getItem('login');
     }

  ngOnInit() {

  }


  onOtpChange(otp: string) {
    this.userOtp = otp;
  }

  submit(){
    if(String(this.userOtp).length != 6){
      this.err = 'Required 6 digit OTP';
      return;
    }
    this.err = '';
    this.processing = true;
    this.isLoading=true
    const data = { email: this.userEmail, otp: this.userOtp };
    this.apiService.verifyOtp(data).subscribe({
      next: (res:any)=>{
        if(res.error == false) {
          this.apiService.presentToast(res.message);
          this.isLoading=false
          this.modalController.dismiss(res.message);
          this.routerNevigate.navigate(['/authentication/login'])
         }else{
          this.isLoading=false
          this.apiService.presentToast(res.message,'danger');
          this.processing = false;
        }
      },
      error: (err:any)=>{
        this.isLoading=false
        this.processing = false;
        this.apiService.presentToast(err.error.message,'danger')
      }
    })
  }

  submitForget(){
    // if(this.userOtp =='' ||this.userOtp ==undefined){
    //   this.apiService.presentToast('Please Enter OTP','danger')
    //   return;
    // }else{
      if(String(this.userOtp).length != 6){
        this.err = 'Required 6 digit OTP';
        return;
      }
      this.err = '';
      this.processing = true;
      this.isLoading=true
      const data = { email: this.userEmail, otp: this.userOtp };
      this.apiService.verifyOtp(data).subscribe({
        next: (res:any)=>{
          if(res.error == false) {
            this.apiService.presentToast(res.message);
            localStorage.removeItem('login');
            this.isLoading=false
            this.routerNevigate.navigateByUrl(`/authentication/new-password?otp=${this.userOtp}&email=${this.userEmail}`)
           }else{
            this.isLoading=false
            this.apiService.presentToast(res.message,'danger');
            this.processing = false;
          }
        },
        error: (err:any)=>{
          this.isLoading=false
          this.processing = false;
          this.apiService.presentToast(err.error.message,'danger')
        }
      })

    // }
  }

  resendOtp(){
    const data = { email: this.userEmail };
    this.apiService.resendOtp(data).subscribe({
      next: (res:any)=>{
        this.apiService.presentToast(res.message);
      },
      error: (err:any)=> this.apiService.presentToast(err.error.message,'danger')
    })
  }
}
