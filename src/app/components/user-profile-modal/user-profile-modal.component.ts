import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
  standalone: true,
  imports: [
    IonicModule,  // Resolves 'ion-*' elements
    FormsModule,  // Resolves [(ngModel)] bindings
    CommonModule  // Resolves date pipe
  ]
})
export class UserProfileModalComponent implements OnInit {
  @Input() userData: any;

  passwordData = {
    new_password: '',
    confirm_password: ''
  };

  isResetting: boolean = false;

  constructor(
    private modalController: ModalController,
    private apiService: ApiService
  ) {}

ngOnInit() {
  // 1. Copy incoming input or fallback to 'user_data'
  let data = this.userData && Object.keys(this.userData).length > 0
    ? { ...this.userData }
    : JSON.parse(localStorage.getItem('user_data') || '{}');

  // 2. If email is empty, pull it from 'userDetails' in localStorage
  if (!data.email) {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    data.email = userDetails.email || data.user_email || '';
  }

  this.userData = data;
}

  dismiss() {
    this.modalController.dismiss({ updated: false });
  }

saveProfile() {
  // Ensure email isn't lost when updating localStorage
  const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
  if (!this.userData.email && userDetails.email) {
    this.userData.email = userDetails.email;
  }

  localStorage.setItem('user_data', JSON.stringify(this.userData));
  this.apiService.presentToast('Profile updated successfully!', 'success');
  this.modalController.dismiss({ updated: true });
}

  resetPassword() {
    if (!this.passwordData.new_password) {
      this.apiService.presentToast('Please enter a new password.', 'danger');
      return;
    }

    if (this.passwordData.new_password !== this.passwordData.confirm_password) {
      this.apiService.presentToast('New passwords do not match.', 'danger');
      return;
    }

    this.isResetting = true;
    
    // Using your existing passwordReset endpoint format: { email, new_password }
    const payload = {
      email: this.userData?.email,
      new_password: this.passwordData.new_password
    };

    console.log(payload);

    this.apiService.passwordReset(payload).subscribe({
      next: (res: any) => {
        this.isResetting = false;
        if (res.error == false) {
          this.apiService.presentToast(res.message || 'Password updated successfully!');
          this.passwordData = { new_password: '', confirm_password: '' };
        } else {
          this.apiService.presentToast(res.message || 'Failed to update password.', 'danger');
        }
      },
      error: (error) => {
        this.isResetting = false;
        this.apiService.handleError(error);
      }
    });
  }
}