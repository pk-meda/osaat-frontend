// eye-conditions-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

export interface EyeCondition {
  id: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-eye-conditions-modal',
  templateUrl: './eye-conditions-modal.component.html',
  styleUrls: ['./eye-conditions-modal.component.scss'],
  standalone:true,
  imports:[FormsModule,CommonModule,ReactiveFormsModule,IonicModule]
})
export class EyeConditionsModalComponent implements OnInit {
  
  eyeConditions: EyeCondition[] = [
    { id: 'red_eye', label: 'Red eye', selected: false },
    { id: 'itchy_eyes', label: 'Itchy eyes', selected: false },
    { id: 'eyelid_lumps', label: 'Eye lid lumps or bumps', selected: false },
    { id: 'hazy_cornea', label: 'Hazy cornea', selected: false },
    { id: 'conjunctival_lumps', label: 'Conjunctival lumps and bumps', selected: false },
    { id: 'pupil_not_clear', label: 'Pupil not clear', selected: false }
  ];

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  onConditionToggle(condition: EyeCondition) {
    condition.selected = !condition.selected;
  }

  async onSubmit() {
    const selectedConditions = this.eyeConditions.filter(condition => condition.selected);
    const hasFailed = selectedConditions.length > 0;
    
    await this.modalController.dismiss({
      result: hasFailed ? 'Failed' : 'Passed',
      selectedConditions: selectedConditions,
      action: hasFailed ? 'register_patient' : 'next_child'
    });
  }

  getSelectedCount(): number {
    return this.eyeConditions.filter(condition => condition.selected).length;
  }

  async onCancel() {
    await this.modalController.dismiss();
  }
}