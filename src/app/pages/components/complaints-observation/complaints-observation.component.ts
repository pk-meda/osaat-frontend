import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ModalController } from '@ionic/angular';
interface ComplaintItem {
  label: string;
  selected: boolean;
}

@Component( {
  selector: 'app-complaints-observation',
  templateUrl: './complaints-observation.component.html',
  styleUrls: [ './complaints-observation.component.scss' ],
  standalone: false
} )
export class ComplaintsObservationComponent implements OnInit {
  complaints: ComplaintItem[] = [
    { label: 'BLURRING', selected: false },
    { label: 'HEADACHE', selected: false },
    { label: 'WATERING', selected: false },
    { label: 'REDNESS', selected: false },
    { label: 'BURNING SENSATION', selected: false },
    { label: 'ITCHING', selected: false },
    { label: 'SQUEEZING', selected: false },
    { label: 'PAIN', selected: false },
    { label: 'REPEATED EYE SWELLING', selected: false },
    { label: 'SQUINTING', selected: false },
    { label: 'DROOPING OF THE LID', selected: false },
    { label: 'NIGHT BLINDNESS', selected: false },
    { label: 'ABNORMAL EYE MOVEMENT', selected: false },
    { label: 'NO COMPLAINTS/observations', selected: false },
  ];

  // “Other” if you add later; kept for forward compatibility.
  isOtherSelected = false;
  otherText = '';

  reference_number: string | null = null;

  /** Eye affected selection. Required ONLY when a complaint (other than NO COMPLAINTS/observations) is chosen. */
  eyeAffected: 'RE' | 'LE' | 'BOTH' | 'UNKNOWN' | null = null;
  schoolName: any;

  /** True only when at least one complaint (excluding NO COMPLAINTS/observations) is selected */
  get hasComplaintSelected(): boolean {
    return this.complaints.some(
      c => c.selected && c.label !== 'NO COMPLAINTS/observations'
    );
  }

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private api: ApiService,
    private modalController: ModalController
  ) {
    this.route.queryParamMap.subscribe(params => {
      this.reference_number = params.get('reference_number');
      if (this.reference_number === null) {
        this.openModal();
      } else {
        this.getDataComplaints();
      }
    });
  }

  ngOnInit() {}

  backLocation() {
    this.location.back();
  }

  /** Fetch saved complaints and hydrate selections. */
  getDataComplaints() {
    this.api.getObservationComplaints(this.reference_number).subscribe(
      (res: any) => {
        if (res && res.body && res.body[0]) {
          const saved = Array.isArray(res.body[0].selected_complaint)
            ? res.body[0].selected_complaint
            : [];

          // reset all
          this.complaints.forEach(c => (c.selected = false));

          // reselect based on saved
          saved.forEach((label: string) => {
            const match = this.complaints.find(c => c.label === label);
            if (match) match.selected = true;
          });

          // handle "NO COMPLAINTS/observations"
          if (saved.length === 0 || saved.includes('NO COMPLAINTS/observations')) {
            const none = this.complaints.find(c => c.label === 'NO COMPLAINTS/observations');
            if (none) none.selected = true;
          }

          // Optional “other” text if API returns it
          // const maybeOther = res.body[0].otherText ?? res.data?.otherText;
          // if (maybeOther) {
          //   this.isOtherSelected = true;
          //   this.otherText = maybeOther;
          // }

          // If API stores eye_affected, populate it but only when there’s an actual complaint
          const savedEye = res.body[0].effected_eye ?? null;
          this.eyeAffected = this.hasComplaintSelected ? savedEye : null;

          // Ensure eye is cleared if "NO COMPLAINTS/observations" is the only selection
          if (!this.hasComplaintSelected) {
            this.eyeAffected = null;
          }
        }
      },
      (err) => {
        // this.api.presentToast(err?.error?.message || 'Failed to load complaints', 'danger');
      }
    );
  }

  /** Open user selector when reference number is not present. */
  async openModal() {
    try {
      const selectedUser = await this.api.openUserSelectionModal();
      this.handleUser(selectedUser);
    } catch (error) {
      console.error('Error opening user selection modal:', error);
    }
  }

  handleUser(user: any) {
    console.log(user,'check user Details')
    this.reference_number = user?.reference_number ?? null;
    this.schoolName = user.school ?? null
    if (this.reference_number) {
      this.getDataComplaints();
    }
  }

  // convention

  /** Enforce mutual exclusivity for "NO COMPLAINTS/observations" and reset eye selection when needed. */
  onComplaintChange(changedComplaint: ComplaintItem) {
    this.complaints.forEach((item) => {
      if (changedComplaint.label === 'NO COMPLAINTS/observations' && changedComplaint.selected) {
        if (item.label !== 'NO COMPLAINTS/observations') item.selected = false;
      } else if (changedComplaint.label !== 'NO COMPLAINTS/observations' && changedComplaint.selected) {
        if (item.label === 'NO COMPLAINTS/observations') item.selected = false;
      }
    });

    if (!this.hasComplaintSelected) {
      this.eyeAffected = null;
    }
  }

  submitForm() {
    const noneSelected = this.complaints.every(item => item.selected === false);

    if (noneSelected) {
      this.api.presentToast(
        'If there is no complaint/observation, please select "NO COMPLAINTS/observations".',
        'danger'
      );
      return;
    }

    const selected = this.complaints
      .filter(c => c.selected && c.label !== 'Other')
      .map(c => c.label);

    if (this.hasComplaintSelected && !this.eyeAffected) {
      this.api.presentToast('Please select which eye is affected.', 'danger');
      return;
    }

    const eyeExam = sessionStorage.getItem('eyeExam');
    const hasComplaint = this.hasComplaintSelected;
    const needsReferral = eyeExam === 'no' || hasComplaint;
    const body: any = {
      selected_complaint: selected,
      reference_number: this.reference_number,
    };
    if (this.hasComplaintSelected && this.eyeAffected) {
      body.effected_eye = this.eyeAffected; 
    }
    if ( this.otherText?.trim()) {
      body.otherText = this.otherText.trim();
    }
    if (needsReferral) {
      this.api.isLoading.next(true);
      this.api.observationComplaints(body).subscribe(
        (res: any) => {
          this.api.isLoading.next(false);
          if (res) {
            this.api.presentToast(res?.message || 'Saved successfully');
            // this.checkAlreadyDoVATEST()
            this.router.navigate(['/layout', 'secoundScreening', this.reference_number]);
          }
        },
        (err) => {
          this.api.isLoading.next(false);
          this.api.presentToast(err?.error?.message || 'Something went wrong', 'danger');
        }
      );
    } else {
      this.router.navigate(['/layout', 'first-screening']);
    }
    sessionStorage.removeItem('eyeExam');
  }

  checkAlreadyDoVATEST(){
    let body ={
      reference_number:this.reference_number
    }
    this.api.profile(body).subscribe((res:any)=>{
      const data = res;
      if(data.second_screening == true){
       this.router.navigate(['/layout/profile']);      
      }else{
        this.router.navigate(['/layout/way-forward'], {
          queryParams: { reference_number: this.reference_number , school : this.schoolName },
        });
        
      }
    })
  }

  onEdit() {
    // this.submitForm.enable();
  }

  onDelete() {
    this.router.navigate( [ '/layout/profile' ] );
  }
}
