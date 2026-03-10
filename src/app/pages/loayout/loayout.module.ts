import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoayoutPageRoutingModule } from './loayout-routing.module';
import { LoayoutPage } from './loayout.page';
import { HeaderComponent } from '../header/header.component';
import { FirstScreeningComponent } from '../components/first-screening/first-screening.component';
import { DispensinComponent } from '../components/dispensing/dispensing.component';
import { RefractionComponent } from '../components/refraction/refraction.component';
import { CreateNewProfileComponent } from '../components/create-new-profile/create-new-profile.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { RecordDiagnosisComponent } from '../components/record-diagnosis/record-diagnosis.component';
import { ProfileFooterComponent } from '../profile-footer/profile-footer.component';
import { SpectacleHistoryComponent } from '../components/spectacle-history/spectacle-history.component';
import { SurgeryTreatmentHistoryComponent } from '../components/surgery-treatment-history/surgery-treatment-history.component';
import { FamilyHistoryComponent } from '../components/family-history/family-history.component';
import { CurrentMedicalTreatmentComponent } from '../components/current-medical-treatment/current-medical-treatment.component';
import { MeasurementVisualAcuityComponent } from '../components/measurement-visual-acuity/measurement-visual-acuity.component';
import { RefractionSpectaclePresentationComponent } from '../components/refraction-spectacle-presentation/refraction-spectacle-presentation.component';
import { OtherMedicalIssuesComponent } from '../components/other-medical-issues/other-medical-issues.component';
import { ParticipantInfoComponent } from '../profile_content/participant-info/participant-info.component';
import { EvaluationModalComponent } from '../evaluation-modal/evaluation-modal.component';
import { ComprehensiveEyeExamComponent } from '../components/comprehensive-eye-exam/comprehensive-eye-exam.component';
import { SecoundScreeningComponent } from '../components/secound-screening/secound-screening.component';
import { InternalExternalComponent } from '../components/internal-external/internal-external.component';
import { ComplaintsObservationComponent } from '../components/complaints-observation/complaints-observation.component';
import { WayForwardComponent } from '../components/way-forward/way-forward.component';
import { ContactNumberOnlyDirective } from 'src/app/helpers/contact-number.directive';
import { SchoolRegisterComponent } from '../school-register-modal/school-register/school-register.component';
import { SharedModule } from 'src/app/helpers/shared.module';
// import { CalibrationTestComponent } from '../components/calibration-test/calibration-test.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoayoutPageRoutingModule,
    ReactiveFormsModule,
    SharedModule  
  ],
  declarations: [LoayoutPage, HeaderComponent, FirstScreeningComponent,InternalExternalComponent,SecoundScreeningComponent,ComprehensiveEyeExamComponent, DispensinComponent, RefractionComponent, CreateNewProfileComponent, ProfileComponent, RecordDiagnosisComponent, ProfileFooterComponent, SpectacleHistoryComponent, SurgeryTreatmentHistoryComponent,FamilyHistoryComponent,CurrentMedicalTreatmentComponent,MeasurementVisualAcuityComponent,RefractionSpectaclePresentationComponent,OtherMedicalIssuesComponent,ParticipantInfoComponent,EvaluationModalComponent,ComplaintsObservationComponent,WayForwardComponent ,SchoolRegisterComponent],
  exports: [ParticipantInfoComponent,SharedModule]
})
export class LoayoutPageModule { }
