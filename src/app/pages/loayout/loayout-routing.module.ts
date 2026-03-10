import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoayoutPage } from './loayout.page';
import { FirstScreeningComponent } from '../components/first-screening/first-screening.component';
import { DispensinComponent } from '../components/dispensing/dispensing.component';
import { RefractionComponent } from '../components/refraction/refraction.component';
import { CreateNewProfileComponent } from '../components/create-new-profile/create-new-profile.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { RecordDiagnosisComponent } from '../components/record-diagnosis/record-diagnosis.component';
import { SpectacleHistoryComponent } from '../components/spectacle-history/spectacle-history.component';
import { SurgeryTreatmentHistoryComponent } from '../components/surgery-treatment-history/surgery-treatment-history.component';
import { FamilyHistoryComponent } from '../components/family-history/family-history.component';
import { CurrentMedicalTreatmentComponent } from '../components/current-medical-treatment/current-medical-treatment.component';
import { MeasurementVisualAcuityComponent } from '../components/measurement-visual-acuity/measurement-visual-acuity.component';
import { RefractionSpectaclePresentationComponent } from '../components/refraction-spectacle-presentation/refraction-spectacle-presentation.component';
import { OtherMedicalIssuesComponent } from '../components/other-medical-issues/other-medical-issues.component';
import { ComprehensiveEyeExamComponent } from '../components/comprehensive-eye-exam/comprehensive-eye-exam.component';
import { SecoundScreeningComponent } from '../components/secound-screening/secound-screening.component';
import { ComplaintsObservationComponent } from '../components/complaints-observation/complaints-observation.component';
import { WayForwardComponent } from '../components/way-forward/way-forward.component';
import { SchoolRegisterComponent } from '../school-register-modal/school-register/school-register.component';
const routes: Routes = [
  // { path: 'select-school', component: SelectSchoolComponent },
  // { path: '', redirectTo: 'select-school', pathMatch: 'full' },
  {
    path: '',
    component: LoayoutPage,
    children: [
      { path: '', redirectTo: 'school-register', pathMatch: 'full' },
      {path:'school-register',component:SchoolRegisterComponent},
      // { path: 'create-new-profile', component: CreateNewProfileComponent }, 
      { path: 'first-screening', component: FirstScreeningComponent },
      { path: 'dispensing', component: DispensinComponent }, 
      { path: 'dispensing/:reference_number', component: DispensinComponent }, 
      { path: 'refraction/:reference_number', component: RefractionComponent }, 
      { path: 'refraction', component: RefractionComponent }, 
      { path: 'profile', component: ProfileComponent }, 
      { path: 'record-diagnosis', component: RecordDiagnosisComponent }, 
      { path: 'record-diagnosis/:reference_number', component: RecordDiagnosisComponent }, 
      { path: 'spectacle-wearing', component: SpectacleHistoryComponent }, 
      { path: 'spectacle-wearing/:reference_number', component: SpectacleHistoryComponent }, 
      { path: 'surgery', component: SurgeryTreatmentHistoryComponent }, 
      { path: 'surgery/:reference_number', component: SurgeryTreatmentHistoryComponent }, 
      { path: 'family', component: FamilyHistoryComponent }, 
      { path: 'family/:reference_number', component: FamilyHistoryComponent }, 
      { path: 'current-medical', component: CurrentMedicalTreatmentComponent }, 
      { path: 'current-medical/:reference_number', component: CurrentMedicalTreatmentComponent }, 
      { path: 'measurement-visual', component: MeasurementVisualAcuityComponent }, 
      { path: 'measurement-visual/:reference_number', component: MeasurementVisualAcuityComponent }, 
      { path: 'other-medical', component: OtherMedicalIssuesComponent }, 
      { path: 'other-medical/:reference_number', component: OtherMedicalIssuesComponent }, 
      { path: 'refraction-spectacle-presentation', component: RefractionSpectaclePresentationComponent }, 
      { path: 'refraction-spectacle-presentation/:reference_number', component: RefractionSpectaclePresentationComponent }, 
      // { path: 'eye_exam', component: ComprehensiveEyeExamComponent }, 
      // { path: 'eye_exam/:reference_number', component: ComprehensiveEyeExamComponent }, 
      { path: 'secoundScreening', component: SecoundScreeningComponent }, 
      { path: 'secoundScreening/:reference_number', component: SecoundScreeningComponent }, 
      { path: 'complaint', component: ComplaintsObservationComponent }, 
      { path: 'complaint/:reference_number', component: ComplaintsObservationComponent }, 
      { path: 'way-forward', component: WayForwardComponent }, 
      { path: 'way-forward/:reference_number', component: WayForwardComponent }, 
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoayoutPageRoutingModule {}
