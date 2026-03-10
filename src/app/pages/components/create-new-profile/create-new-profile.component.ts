// create-new-profile.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, MaxLengthValidator, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/helpers/auth/authentication.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-create-new-profile',
  templateUrl: './create-new-profile.component.html',
  styleUrls: ['./create-new-profile.component.scss'],
  standalone: false
})
export class CreateNewProfileComponent implements OnInit {
  studentProfileForm!: FormGroup;
  currentStep = 1;
  totalSteps = 1;
  countries: any[] = [];
  provinces: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.studentProfileForm = this.fb.group({
      country: ['', Validators.required],
      province: ['', Validators.required],
      school_name: ['', Validators.required],
      children_count: ['', Validators.required],
      address: ['', Validators.required],
      contact_person: ['', [Validators.required,Validators.maxLength(10)]],
      contact_details: ['', [Validators.required,Validators.maxLength(10)]],
      referral_clinic: ['',]
    });

    // load countries
    this.getCountryJson()
  }

  getCountryJson() {
    this.apiService.getCountryJson().subscribe((res: any) => {
      console.log(res.country)
      this.countries = res;
    })
  }

  onCountrySelect(event: any) {
    const selectedCountry = this.countries.find(c => c.country === event.detail.value);
    if (selectedCountry) {
      this.provinces = selectedCountry.states;
      this.studentProfileForm.patchValue({ province: '' }); // reset province on change
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submitForm() {
    console.log(this.studentProfileForm.value)
    if (this.studentProfileForm.valid) {
      this.apiService.isLoading.next(true);
      const newSchoolData = this.studentProfileForm.value;
      this.apiService.School(newSchoolData).subscribe((res: { error: any; message: any; }) => {
        if (!res.error) {
          this.router.navigate(['/layout/profile']);
          this.apiService.isLoading.next(false);
          this.apiService.presentToast(res.message || 'School Created Successfully!');
        } else {
          this.apiService.isLoading.next(false);
          this.apiService.presentToast(res.message, 'danger');
        }
      }, (err: any) => {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast('Something Went Wrong', 'danger');
      });
    } else {
      this.apiService.presentToast('Please complete all required fields.', 'danger');
      this.studentProfileForm.reset()
    }
  }

  backLocation() {
    this.router.navigate(['/layout/profile']);

  }

  onEdit() {
    this.studentProfileForm.enable();
  }

  onDelete() {
    this.router.navigate(['/layout/profile']);
  }
}
