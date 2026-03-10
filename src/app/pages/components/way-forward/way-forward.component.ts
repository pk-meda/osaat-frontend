import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-way-forward',
  templateUrl: './way-forward.component.html',
  styleUrls: ['./way-forward.component.scss'],
  standalone: false
})
export class WayForwardComponent implements OnInit {
  selectedReferral: string = '';
  schoolName:any; // You can load from backend or query param
  isloading:boolean= false;
  reference_number: any | null;

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService) {
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      this.schoolName = params.get('school');
    });
  }

  ngOnInit() { }

  backLocation() {
    this.router.navigate(['/layout/profile']);
  }

  submitForm() {
    if(!this.selectedReferral){
       this.apiService.presentToast('Please select one option','danger');
       return;
    }
    this.isloading = true;
    console.log('Referral selected:', this.selectedReferral);
    if(this.selectedReferral !== "none"){
      this.router.navigate(['/layout/secoundScreening'],{queryParams: { reference_number: this.reference_number},});
      this.isloading = false;
    }else{
      this.router.navigate(['/layout/profile']);
      this.isloading = false;
    }
  }

}
