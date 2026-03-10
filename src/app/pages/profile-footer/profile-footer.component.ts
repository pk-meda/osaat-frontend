import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile-footer',
  templateUrl: './profile-footer.component.html',
  styleUrls: ['./profile-footer.component.scss'],
  standalone:false
})
export class ProfileFooterComponent {
  @Input() currentStep!: number;
  @Input() totalSteps!: number;
    @Input() saveDisabled: boolean = false;
  @Output() previousStepClick = new EventEmitter<void>();
  @Output() nextStepClick = new EventEmitter<void>();
  @Output() saveProgressClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();
constructor(public apiService:ApiService) {
  console.log('ProfileFooterComponent constructor called');
}

  onPreviousStep() {
    this.previousStepClick.emit();
  }

  onNextStep() {
    console.log('Footer: onNextStep() called');
    this.nextStepClick.emit();
  }

  onSaveProgress() {
    this.saveProgressClick.emit();
  }
  onEdit() {
    this.editClick.emit();
  }
  onDelete(){
    this.deleteClick.emit();
  }
}
