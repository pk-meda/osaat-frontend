import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { ModalController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { Country, State } from 'country-state-city';

@Component({
  selector: 'app-school-register',
  templateUrl: './school-register.component.html',
  styleUrls: ['./school-register.component.scss'],
  standalone: false,
})
export class SchoolRegisterComponent implements OnInit {
  mode: 'select' | 'register' = 'select';
  screeningForm!: FormGroup;
  oldscreeningForm!: FormGroup;
  school: any[] = [];
  filteredSchools: any[] = [];
  submitted = false;

  // controls for dynamic dropdowns
  searchControl = new FormControl('');
  countrySearchControl = new FormControl('');
  provinceSearchControl = new FormControl('');

  // dropdown visibility flags
  showDropdown = false;
  showCountryDropdown = false;
  showProvinceDropdown = false;

  countries: any[] = [];
  filteredCountries: any[] = [];
  provinces: any[] = [];
  filteredProvinces: any[] = [];
  screeningId: any;
  countryCode: string = '';
  userData: any;
  userCountry: any;
  selectedCountry: any = null;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private router: Router,
    private route: ActivatedRoute,
    private modal: ModalController
  ) {}

  ngOnInit() {
    this.userData = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const mobile = this.userData?.mobile_number || '';
    this.countryCode = this.getCountryCodeFromMobile(mobile);
    this.screeningId = window.location.href.split('/').includes('first-screening');

    this.initForms();
    this.loadCountries();
    this.preselectUserCountry();
    this.setupFilters();
  }

  getCountryCodeFromMobile(mobile: string): string {
    if (!mobile || !mobile.startsWith('+')) return '';
    const digits = mobile.replace(/\D/g, '');
    if (digits.length <= 10) return '';
    return '+' + digits.substring(0, digits.length - 10);
  }

  initForms() {
    this.oldscreeningForm = this.fb.group({
      School_name: ['', Validators.required],
    });
    this.screeningForm = this.fb.group({
      newSchoolName: ['', Validators.required],
      address: ['', Validators.required],
      contact: ['', Validators.required],
      country: ['', Validators.required],
      province: ['', Validators.required],
    });
  }

  setupFilters() {
    this.searchControl.valueChanges.subscribe(text => {
      const q = (text || '').toLowerCase();
      this.filteredSchools = this.school.filter(s =>
        s.school_name.toLowerCase().includes(q)
      );
    });

    this.countrySearchControl.valueChanges.subscribe(text => {
      const q = (text || '').toLowerCase();
      this.filteredCountries = this.countries.filter(c =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
      );
    });

    this.provinceSearchControl.valueChanges.subscribe(text => {
      const q = (text || '').toLowerCase();
      this.filteredProvinces = this.provinces.filter(p =>
        p.name.toLowerCase().includes(q)
      );
    });
  }

  onModeChange(event: any) {
    this.mode = event.detail.value;
    this.submitted = false;
    this.showDropdown = false;
    this.showCountryDropdown = false;
    this.showProvinceDropdown = false;
  }

  loadCountries() {
    this.countries = Country.getAllCountries().map((c: any) => ({
      name: c.name,
      code: `+${c.phonecode}`,
      flag: c.flag,
      isoCode: c.isoCode
    }));
    this.filteredCountries = [...this.countries];
  }

  preselectUserCountry() {
    if (!this.countryCode) return;
    const sel = this.countries.find(c => c.code === this.countryCode);
    if (sel) {
      this.userCountry = sel;
      this.selectedCountry = sel;
      this.screeningForm.patchValue({
        country: `${sel.flag} ${sel.name} (${sel.code})`
      });
      this.provinces = State.getStatesOfCountry(sel.isoCode);
      this.filteredProvinces = [...this.provinces];
      this.loadSchools();
    }
  }

  loadSchools() {
    this.apiService.getSchool().subscribe({
      next: (res: any) => {
        const allSchools = res.body || [];
        const countryName = this.selectedCountry?.name?.toLowerCase();
        const provinceName = this.screeningForm.value.province?.toLowerCase();

        this.school = allSchools.filter((s: any) => {
          const matchesCountry = s.country?.toLowerCase() === countryName;
          const matchesProvince = !provinceName || provinceName === 'none' ||
            s.province?.toLowerCase() === provinceName;
          return matchesCountry && matchesProvince;
        });

        this.filteredSchools = [...this.school];
      },
      error: () => {
        this.presentToast('Failed to load schools. Please try again.', 'danger');
      }
    });
  }

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    if (this.showCountryDropdown) this.clearCountrySearch();
  }

  clearCountrySearch() {
    this.countrySearchControl.setValue('');
    this.filteredCountries = [...this.countries];
  }

  selectCountry(country: any) {
    this.selectedCountry = country;
    this.screeningForm.patchValue({
      country: `${country.flag} ${country.name} (${country.code})`,
      province: ''
    });
    this.oldscreeningForm.patchValue({ School_name: '' });
    
    // Load provinces for selected country
    this.provinces = State.getStatesOfCountry(country.isoCode);
    this.filteredProvinces = [...this.provinces];
    
    this.showCountryDropdown = false;
    this.loadSchools();
  }

  toggleDropdown() {
    if (!this.selectedCountry) {
      this.presentToast('Please select a country first.', 'warning');
      return;
    }
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.clearSearch();
  }

  clearSearch() {
    this.searchControl.setValue('');
    this.filteredSchools = [...this.school];
  }

  selectSchool(name: string) {
    this.oldscreeningForm.patchValue({ School_name: name });
    this.showDropdown = false;
  }

  toggleProvinceDropdown() {
    if (!this.selectedCountry) {
      this.presentToast('Please select a country first.', 'warning');
      return;
    }
    this.showProvinceDropdown = !this.showProvinceDropdown;
    if (this.showProvinceDropdown) this.clearProvinceSearch();
  }

  clearProvinceSearch() {
    this.provinceSearchControl.setValue('');
    this.filteredProvinces = [...this.provinces];
  }

  selectProvince(name: string) {
    if (name === 'None') {
      this.screeningForm.patchValue({ province: '' });
    } else {
      this.screeningForm.patchValue({ province: name });
    }
    this.oldscreeningForm.patchValue({ School_name: '' });
    this.showProvinceDropdown = false;
    this.loadSchools();
  }

  async registerSchool() {
    this.submitted = true;
    if (this.screeningForm.invalid) {
      this.presentToast('Please fill in all required fields.', 'warning');
      return;
    }
    const newSchool = {
      school_name: this.screeningForm.value.newSchoolName.trim(),
      address: this.screeningForm.value.address.trim(),
      contact_details: this.screeningForm.value.contact.trim(),
      country: this.selectedCountry?.name,
      province: this.screeningForm.value.province.trim()
    };
    this.apiService.registerSchool(newSchool).subscribe({
      next: (response: any) => {
        this.school.push(response.body);
        this.filteredSchools = [...this.school];
        this.presentToast('School registered successfully! Select it to proceed.', 'success');
        this.mode = 'select';
        this.resetForm();
      },
      error: () => {
        this.presentToast('Failed to register school. Please try again.', 'danger');
      }
    });
  }

  resetForm() {
    this.screeningForm.setValue({
      newSchoolName: '',
      address: '',
      contact: '',
      province: '',
      country: this.selectedCountry ? `${this.selectedCountry.flag} ${this.selectedCountry.name} (${this.selectedCountry.code})` : ''
    });
  }

  submitCloseModal() {
    this.submitted = true;
    if (this.oldscreeningForm.invalid) {
      this.presentToast('Please select a school first.', 'danger');
      return;
    }
    this.modal.dismiss({ schoolName: this.oldscreeningForm.value.School_name });
  }

  async submit() {
    this.submitted = true;
    if (this.oldscreeningForm.invalid) {
      this.presentToast('Please select a school first.', 'danger');
      return;
    }
    localStorage.setItem('school_name', this.oldscreeningForm.value.School_name);
    this.router.navigate(['/layout/profile']);
  }

  private async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color,
      buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
    await toast.present();
  }

  backLocation() {
    this.router.navigate(['/layout/profile']);
    this.modal.dismiss();
  }
}