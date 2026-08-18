import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, ModalController } from '@ionic/angular';
import { UserProfileModalComponent } from './components/user-profile-modal/user-profile-modal.component'; // Adjust path if needed
import { ApiService } from './services/api.service'; // Adjust path if needed

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  userProfile: any = {
    id: null,
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    last_login: '',
    date_joined: ''
  };

  constructor(
    private router: Router,
    private menuController: MenuController,
    private ngZone: NgZone,
    private modalController: ModalController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Attempt to pull user data from localStorage or fetch from profile endpoint
    const storedUser = localStorage.getItem('user_data');
    if (storedUser) {
      try {
        this.userProfile = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error parsing user data from storage', e);
      }
    }

    // Optionally fetch fresh auth_user details from API if available
    this.apiService.profile({}).subscribe({
      next: (res: any) => {
        if (res) {
          this.userProfile = {
            id: res.id,
            username: res.username,
            first_name: res.first_name,
            last_name: res.last_name,
            email: res.email,
            last_login: res.last_login,
            date_joined: res.date_joined
          };
          localStorage.setItem('user_data', JSON.stringify(this.userProfile));
        }
      },
      error: (err) => {
        console.log('Using cached user profile data.');
      }
    });
  }

  getUserInitial(): string {
    if (this.userProfile?.first_name) {
      return this.userProfile.first_name.charAt(0).toUpperCase();
    }
    if (this.userProfile?.username) {
      return this.userProfile.username.charAt(0).toUpperCase();
    }
    return 'U';
  }

  async openProfileModal() {
    await this.menuController.close('main-menu');

    const modal = await this.modalController.create({
      component: UserProfileModalComponent,
      componentProps: { userData: this.userProfile },
      cssClass: 'modern-profile-modal',
     // breakpoints: [0, 0.85, 1],
    //initialBreakpoint: 0.85
    
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data && data.updated) {
      this.loadUserData();
    }
  }

  async logout() {
    localStorage.clear(); 
    sessionStorage.clear();
    await this.menuController.close('main-menu');
    this.ngZone.run(() => {
      this.router.navigateByUrl('/authentication', { replaceUrl: true }).then(() => {
        window.location.reload();
      });
    });
  }
}