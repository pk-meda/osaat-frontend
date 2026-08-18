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
  schoolName: any; 
  isloading: boolean = false;
  reference_number: any | null;
  testResult: string | null = null;
  wearsSpectacles: boolean = false;
  isSecondScreeningCompleted: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService) {
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      this.schoolName = params.get('school');
      this.testResult = params.get('result'); // 'pass' or 'fail'
      this.wearsSpectacles = params.get('wears_spectacles') === 'true';
      this.isSecondScreeningCompleted = params.get('second_screening') === 'true';
    });
  }

  ngOnInit() { }

  backLocation() {
    this.router.navigate(['/layout/profile']);
  }

  submitForm() {
    if (!this.selectedReferral) {
      this.apiService.presentToast('Please select one option', 'danger');
      return;
    }
    
    this.isloading = true;
    console.log('Referral selected:', this.selectedReferral);

    // If second screening was already completed
    if (this.isSecondScreeningCompleted) {
      this.isloading = false;
      this.router.navigate(['/layout/secoundScreening'], {
        queryParams: { reference_number: this.reference_number }
      });
      return;
    }

    // Handle routing logic based on user choice and previous visual acuity test results
    if (this.selectedReferral !== "none") {
      // If referred to second screening / school / clinic
      this.router.navigate(['/layout/secoundScreening'], {
        queryParams: { reference_number: this.reference_number }
      });
    } else {
      // If "No referral" was chosen:
      if (this.testResult === 'fail') {
        if (this.wearsSpectacles) {
          this.router.navigate(['/layout/refraction-spectacle-presentation'], {
            queryParams: { reference_number: this.reference_number }
          });
        } else {
          this.router.navigate(['/layout/refraction'], {
            queryParams: { reference_number: this.reference_number }
          });
        }
      } else {
        // Passed test with no referral
        this.router.navigate(['/layout/first-screening'], {
          queryParams: { reference_number: this.reference_number }
        });
      }
    }
    
    this.isloading = false;
  }
}