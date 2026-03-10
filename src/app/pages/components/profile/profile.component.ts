import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  reference_number: any;
  userData: any;

  constructor(
    private apiService: ApiService,
    private activateRoute: ActivatedRoute,
    private location: Location,
    private router:Router
  ) {
    // this.activateRoute.queryParams.subscribe(params => {
    //   console.log(params);
    //   this.reference_number = params['reference_number'];
    // });
    // if (this.reference_number) {
    //   this.getUserProfile();
    // }
  }

  ngOnInit() {

  }

  // getUserProfile() {
  //   console.log(typeof this.reference_number);

  //   let data = {
  //     reference_number: this.reference_number
  //   }
  //   this.apiService.profile(data).subscribe(res => {
  //     console.log(res);
  //     this.userData = res.body;
  //     localStorage.setItem('userdata', JSON.stringify(this.userData))
  //   })
  // }

  backLocation() {
    this.location.back();
  }
  
  // nevigateProfile() {
  //   this.apiService.nevigateProfile(this.reference_number);
  // }

  CreateNewFile() {
    // this.router.navigate(['/layout/create-new-profile']);
    this.router.navigate(['/layout/school-register']);
  }


  Logout(){
    localStorage.clear();
    this.router.navigate(['/authentication/login']);
  }
}
