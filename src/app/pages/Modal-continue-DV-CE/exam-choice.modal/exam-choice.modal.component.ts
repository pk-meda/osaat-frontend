import { Component } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component( {
  selector: 'app-exam-choice-modal',
  templateUrl: './exam-choice.modal.component.html',
  styleUrls: [ './exam-choice.modal.component.scss' ],
  imports: [ CommonModule, FormsModule, IonicModule ],
  standalone: true
} )
export class ExamChoiceModal {
  RouteCheck :boolean = false;
  constructor( private modalCtrl: ModalController, private router: Router ) {
    const route = window.location.href.split( "/" )[4]
    console.log(route,'andswww')
    if(route == "first-screening"){
      this.RouteCheck = true;
      console.log('good')
    }else{
      this.RouteCheck = false;
    }
  }

  async doETest() {
    await this.modalCtrl.dismiss( { title: 'doETest'} );
  }

  async doVAChart() {
    await this.modalCtrl.dismiss( { title: 'doVAChart'} );
  }

  async SecoundScreen() {
    await this.modalCtrl.dismiss( { title: 'SecoundScreen'} );
  }

  async  cancel() {
  await  this.modalCtrl.dismiss({title:'cancel'});
  }
}
