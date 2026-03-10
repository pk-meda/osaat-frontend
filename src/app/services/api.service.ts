import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ModalController, ToastController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { Router } from '@angular/router';
import { UserSelectionModalComponent } from '../pages/user-selection-modal/user-selection-modal/user-selection-modal.component';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  apiUrl: string = environment.baseApiUrl;
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(private http: HttpClient, private toaster: ToastController, private router: Router,private modalController:ModalController) { }
  SchoolJson = 'assets/schools.json';
  getSchools(): Observable<any> {
    return this.http.get(this.SchoolJson);
  }
  async presentToast(msg: any, color: any = 'success', position: any = 'bottom', duration: any = 2000) {
    let toast = await this.toaster.create({
      message: msg,
      color: color,
      position: position,
      duration: 3000
    })
    toast.present();
  }
  nevigateProfile(reference_number: any) {
    this.router.navigate(['/layout/create-new-profile'], { queryParams: { reference_number: reference_number } });
  }
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, data);
  }
  School(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}School`, data);
  }
  getSchool(): Observable<any> {
    return this.http.get(`${this.apiUrl}school`);
  }
  getfailedStudent(school_name: any): Observable<any> {
    return this.http.get(`${this.apiUrl}failed-students?school=${school_name ? school_name : null}`);
  }
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, data);
  }
  resendOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}send-otp`, data);
  }
  comprehensive_eye_exam(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Comprehensive`, data);
  }
  seoundScreening(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Second-screening`, data);
  }
  getSeoundScreening(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Second-screening?reference_number=${id}`);
  }
  refresh(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}refresh-token`, body).pipe(
      tap((response: any) => {
        // let res = this._authenticationService.currentUserValue
        // let userData = {token:response.access_token, id:res.id ,email:res.email,refresh_token: res.refresh_token}
        // this._authenticationService.setLogin(userData)
      })
    );
  }
  sendOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}send-otp`, data);
  }
  verifyOtp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}verify-otp`, data);
  }
  passwordReset(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}password-reset`, data);
  }
  studentsRegiter(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}students-register`, data);
  }
  firstScreening(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}first-screening`, data);
  }
  reference_number(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}reference_number`, data);
  }

  DeletefirstScreening(id: any): Observable<any> {
    return this.http.delete(`${this.apiUrl}first-screening?reference_number=${id}`);
  }

  getfirstScreening(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}first-screening?reference_number=${id}`);
  }

  Current_Medical(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Current_Medical`, data);
  }
  Get_Current_Medical(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Current_Medical?reference_number=${id}`);
  }
  Dispensing(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Dispensing`, data);
  }
  getDispensing(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Dispensing?reference_number=${id}`);
  }
  refractionExamination(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Refraction-Examination`, data);
  }
  getrefractionExamination(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Refraction-Examination?reference_number=${id}`);
  }
  SurgeryHistory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Surgery-History`, data);
  }
  getSurgeryHistory(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Surgery-History?reference_number=${id}`);
  }
  profile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Profile`, data);
  }
  FamilyHistory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Family-History`, data);
  }
  getFamilyHistory(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Family-History?reference_number=${id}`);
  }
  VisualAcuity(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}VisualAcuity`, data);
  }
  getVisualAcuity(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}VisualAcuity?reference_number=${id}`);
  }
  RefractionSpectacle(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}RefractionSpectacle`, data);
  }
  GetRefractionSpectacle(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}RefractionSpectacle?reference_number=${id}`);
  }
  SpectacleHistory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Spectacle-History`, data);
  }
  getSpectacleHistory(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Spectacle-History?reference_number=${id}`,);
  }
  RefractionExamination(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Refraction-Examination`, data);
  }
  Diagnosis(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Diagnosis`, data);
  }
  getDiagnosis(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}Diagnosis?reference_number=${id}`);
  }
  OtherMedicalHistory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}other-medical-history`, data);
  }
  GetOtherMedicalHistory(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}other-medical-history?reference_number=${id}`);
  }
  getParticipant(): Observable<any> {
    return this.http.get(`${this.apiUrl}get_all_participants`);
  }
  async handleError(error: HttpErrorResponse): Promise<Observable<any>> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      let msg = error.error?.message || error.message;
      errorMessage = `${msg}`;
    }
    const status = await Network.getStatus();
    if (!status.connected) {
      errorMessage = 'No Internet Connection';
    }
    this.presentToast(errorMessage, 'danger', 'top', 5000)
    return throwError(errorMessage);
  }
  getCountryJson(): Observable<any> {
    return this.http.get("./assets/countries+states.json");
  }
  observationComplaints(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}complaints`, data);
  }
  getObservationComplaints(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}complaints?reference_number=${id}`);
  }
  registerSchool(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}school`, data);
  }
  async openUserSelectionModal(): Promise<any> {
  const modal = await this.modalController.create({
    component: UserSelectionModalComponent,
    cssClass: 'user-selection-modal',
    backdropDismiss: false,
    showBackdrop: true
  });

  await modal.present();
  
  const { data } = await modal.onDidDismiss();
  console.log('Modal dismissed with data:', data);
  
  return data?.selectedUser || null;
}
async selectUser(onUserSelected: (user: any) => void, onCancel?: () => void): Promise<void> {
  try {
    const selectedUser = await this.openUserSelectionModal();
    
    if (selectedUser) {
      onUserSelected(selectedUser);
    } else if (onCancel) {
      onCancel();
    }
  } catch (error) {
    console.error('Error opening user selection modal:', error);
    if (onCancel) {
      onCancel();
    }
  }
}
async selectUserPromise(): Promise<any> {
  try {
    return await this.openUserSelectionModal();
  } catch (error) {
    console.error('Error in selectUserPromise:', error);
    return null;
  }
}
async closeModal(): Promise<void> {
  try {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  } catch (error) {
    console.error('Error closing modal:', error);
  }
}
async isModalOpen(): Promise<boolean> {
  const modal = await this.modalController.getTop();
  return !!modal;
}
async closeUserSelectionModal(): Promise<void> {
  try {
    const modal = await this.modalController.getTop();
    if (modal && modal.component === UserSelectionModalComponent) {
      await modal.dismiss();
    }
  } catch (error) {
    console.error('Error closing user selection modal:', error);
  }
}
}