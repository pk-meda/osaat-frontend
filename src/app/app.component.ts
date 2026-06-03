import { Component, NgZone } from '@angular/core'; // <-- Ensure NgZone has a capital N and Z
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
    private menuController: MenuController,
    private ngZone: NgZone // <-- Lowercase property name, Uppercase NgZone type
  ) {
  }
async logout() {
    // 1. Wipe out data storage tokens immediately first
    localStorage.clear(); 
    sessionStorage.clear();

    // 2. Start closing the menu drawer overlay animation
    await this.menuController.close('main-menu');

    // 3. Force Angular to run navigation inside its active tracking zone instantly
    this.ngZone.run(() => {
      this.router.navigateByUrl('/authentication', { replaceUrl: true }).then(() => {
        // Optional safety: If the UI still feels stuck, force a clean DOM scene reload instantly
        window.location.reload();
      });
    });
  }
}
