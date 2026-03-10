import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-internal-external',
  templateUrl: './internal-external.component.html',
  styleUrls: ['./internal-external.component.scss'],
  standalone:false
})
export class InternalExternalComponent  implements OnInit {
  selectedOption:any;
  @Input() screeningType!: string; 

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private router:Router,
    // private location:Location
  ) {
  }
  ngOnInit(): void {
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.modalCtrl.dismiss({ result: this.selectedOption });
  }

  dismissModal() {
    this.modalCtrl.dismiss({ result: this.selectedOption });
  }

  backLocation() {
    this.router.navigate(['/layout/profile']);
  }
  
}
