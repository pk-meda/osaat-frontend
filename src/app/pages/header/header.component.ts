import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:false
})
export class HeaderComponent  implements OnInit {
  constructor(private menuCtrl: MenuController
  ) { 
  }
  openMenu() {
    this.menuCtrl.open('main-menu');
  }

  ngOnInit() {}

}
