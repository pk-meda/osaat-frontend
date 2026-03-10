// dispensing.component.ts
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dispensing',
  templateUrl: './dispensing.component.html',
  styleUrls: ['./dispensing.component.scss'],
  standalone: false,
})
export class DispensinComponent implements OnInit {
  screeningForm!: FormGroup;

  // wizard
  currentStep = 1;
  totalSteps = 3;
  submitted = false;

  // data / routing
  dispenseData: any;
  reference_number: string | null = null;
  participantData: any;
  profileRes: any;

  // UI options
  lensesOptions = [
    'Single Vision Distance only',
    'Single vision near only',
    'Bifocals',
    'multifocals',
    'both single vision distance and single vision near - 2pairs',
  ];

  statusOptions = [
    'Spectacles ordered',
    'Spectacles ready',
    'Spectacles received at school',
    'spectacles dispensed to child',
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {
    // Get reference number or prompt selector
    this.route.queryParamMap.subscribe(async (params) => {
      this.reference_number = params.get('reference_number');
      if (this.reference_number == "null" || this.reference_number == null) {
        await this.openModal();
      }else{
        this.loadProfile(this.reference_number);
        this.loadDispensing(this.reference_number);
      }
    });
  }

  ngOnInit(): void {
    this.screeningForm = this.fb.group({
      // Q1
      lenses_type: ['', Validators.required],

      // Q2
      pd_distance: [null, [Validators.required, Validators.min(50), Validators.max(90)]],
      pd_near: [null, [Validators.required, Validators.min(50), Validators.max(90)]],

      // Q3 (conditionally required)
      frame_distance: [''],
      frame_near: [''],
      frame_bifocal: [''],

      // Q4
      // fitting_height_re: [null, [Validators.required, Validators.min(10), Validators.max(30)]],
      fitting_height_re: [null,],
      fitting_height_le: [null,],

      // Q5
      comments: [''],

      // Q6
      provision_date: [null, Validators.required],

      // Q7
      provision_status: ['', Validators.required],
    });

    if (this.reference_number) {
      this.loadDispensing(this.reference_number);
    }
  }

  // convenient getter
  get f() { return this.screeningForm.controls; }

  // ---------- helpers ----------
  private toNumOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  // Normalize API ISO (with microseconds) to YYYY-MM-DD for ion-datetime
  private toDateOnlyForIon(iso: any): string | null {
    if (!iso) return null;
    const s = String(iso);

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already date-only

    // Trim microseconds to milliseconds if present
    const trimmed = s.replace(/\.(\d{3})\d+Z$/, '.$1Z');

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

    const maybeDate = s.split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(maybeDate) ? maybeDate : null;
  }

  // Convert YYYY-MM-DD back to ISO for API
  private dateOnlyToIso(dateOnly: any): string | null {
    if (!dateOnly) return null;
    const s = String(dateOnly);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      // Midnight UTC — adjust to local if your API expects local time
      return new Date(s + 'T00:00:00Z').toISOString();
    }
    return s; // already ISO-ish
  }

  private mapApiToForm(data: any) {
    return {
      lenses_type: data?.lenses_type ?? '',
      pd_distance: this.toNumOrNull(data?.pd_distance),
      pd_near: this.toNumOrNull(data?.pd_near),
      frame_distance: data?.frame_distance ?? '',
      frame_near: data?.frame_near ?? '',
      frame_bifocal: data?.frame_bifocal ?? '',
      fitting_height_re: this.toNumOrNull(data?.fitting_height_re),
      fitting_height_le: this.toNumOrNull(data?.fitting_height_le),
      comments: data?.comments ?? '',
      provision_date: this.toDateOnlyForIon(data?.provision_date),
      provision_status: data?.provision_status ?? '',
    };
  }

  // ---------- Data loaders ----------
  private loadProfile(reference_number: string) {
    const body = { reference_number };
    this.apiService.profile(body).subscribe((res: any) => {
      this.profileRes = res?.body ?? res;
      this.participantData =
        this.profileRes ||
        { id: '', name: '', age: null, grade: '', school: '' };
    });
  }

  private loadDispensing(reference_number: string) {
    this.apiService.getDispensing(reference_number).subscribe(res => {
      if (res && !res.error && res.body) {
        const data = res.body;
        this.screeningForm.patchValue(this.mapApiToForm(data));

        // Apply conditional requireds based on loaded lens type
        if (data?.lenses_type) {
          this.applyFrameFieldRequirements(data.lenses_type);
        }

        this.screeningForm.disable(); // keep your read-only UX for existing record
      }
    },err=>{
       
    });
  }

  // ---------- Modal to pick user when no reference number ----------
  async openModal() {
    try {
      const selectedUser = await this.apiService.openUserSelectionModal();
      this.handleUser(selectedUser);
      if (this.reference_number) {
        this.loadProfile(this.reference_number);
        this.loadDispensing(this.reference_number);
      }
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }

  handleUser(user: any) {
    this.reference_number = user?.reference_number ?? null;
  }

  // ---------- Lens type → frame field requirements ----------
  onLensesChange(value: string) {
    this.applyFrameFieldRequirements(value);
  }

  private applyFrameFieldRequirements(lenses: string) {
    const fd = this.f['frame_distance'];
    const fn = this.f['frame_near'];
    const fbm = this.f['frame_bifocal'];

    fd.clearValidators(); fn.clearValidators(); fbm.clearValidators();

    if (lenses === 'Single Vision Distance only') {
      fd.setValidators([Validators.required]);
    } else if (lenses === 'Single vision near only') {
      fn.setValidators([Validators.required]);
    } else if (lenses === 'both single vision distance and single vision near - 2pairs') {
      fd.setValidators([Validators.required]);
      fn.setValidators([Validators.required]);
    } else if (lenses === 'Bifocals' || lenses === 'multifocals') {
      fbm.setValidators([Validators.required]);
    }

    fd.updateValueAndValidity();
    fn.updateValueAndValidity();
    fbm.updateValueAndValidity();
  }

  // ---------- Wizard nav ----------
  nextStep() {
    this.submitted = true;

    if (this.currentStep === 1) {
      const controlsToCheck: AbstractControl[] = [
        this.f['lenses_type'], this.f['pd_distance'], this.f['pd_near'],
        this.f['frame_distance'], this.f['frame_near'], this.f['frame_bifocal'],
      ];
      if (controlsToCheck.some(c => c.invalid)) {
        controlsToCheck.forEach(c => c.markAsTouched());
        return;
      }
    } else if (this.currentStep === 2) {
      const controlsToCheck: AbstractControl[] = [
        this.f['fitting_height_re'], this.f['fitting_height_le'],
      ];
      if (controlsToCheck.some(c => c.invalid)) {
        controlsToCheck.forEach(c => c.markAsTouched());
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.submitted = false;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submitted = false;
    }
  }

  // ---------- Submit ----------
  submitForm() {
    this.submitted = true;

    if (this.f['provision_date'].invalid || this.f['provision_status'].invalid) {
      this.f['provision_date'].markAsTouched();
      this.f['provision_status'].markAsTouched();
      return;
    }

    this.apiService.isLoading.next(true);

    const payload = {
      reference_number: this.reference_number,
      lenses_type: this.f['lenses_type'].value,
      pd_distance: this.toNumOrNull(this.f['pd_distance'].value),
      pd_near: this.toNumOrNull(this.f['pd_near'].value),
      frame_distance: this.f['frame_distance'].value,
      frame_near: this.f['frame_near'].value,
      frame_bifocal: this.f['frame_bifocal'].value,
      fitting_height_re: this.toNumOrNull(this.f['fitting_height_re'].value),
      fitting_height_le: this.toNumOrNull(this.f['fitting_height_le'].value),
      comments: this.f['comments'].value,
      // convert YYYY-MM-DD back to ISO for API
      provision_date: this.dateOnlyToIso(this.f['provision_date'].value),
      provision_status: this.f['provision_status'].value,
      dispensing: true,
    };

    this.apiService.Dispensing(payload).subscribe(
      (res: any) => {
        this.dispenseData = res?.body;
        if (res?.error === false) {
          this.apiService.presentToast(res.message);
          this.apiService.isLoading.next(false);
          this.router.navigate(
            ['/layout/measurement-visual'],
            { queryParams: { reference_number: this.reference_number || '' } }
          );
        } else {
          this.apiService.isLoading.next(false);
          this.apiService.presentToast(res?.message || 'Unable to save', 'danger');
        }
      },
      () => {
        this.apiService.isLoading.next(false);
        this.apiService.presentToast('Something Went Wrong', 'danger');
      }
    );
  }

  // ---------- Misc nav ----------
  backLocation() { this.router.navigate(['/layout/profile']); }
  nevigateProfile() { this.apiService.nevigateProfile(this.reference_number); }
  onEdit() { this.screeningForm.enable(); }
  onDelete() { this.router.navigate(['/layout/profile']); }
}
