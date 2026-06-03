import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private router: Router,
    private menuController: MenuController
  ) {
  }
  async logout() {
    // 1. Instantly close the side menu drawer safely
    await this.menuController.close('main-menu');

    // 2. Clear out application tokens/storage matching your profile logout logic
    localStorage.clear(); 
    sessionStorage.clear();

    // 3. Kick the user back to the authentication screen safely
    this.router.navigateByUrl('/authentication', { replaceUrl: true });
  }
}
