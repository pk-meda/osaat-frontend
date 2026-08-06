// station-stepper.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StationService } from '../../services/station.service';
import { CommonModule } from '@angular/common'; // <--- Import CommonModule
import { IonicModule } from '@ionic/angular';   // <--- Import IonicModule
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-station-stepper',
  templateUrl: './station-stepper.component.html',
  styleUrls: ['./station-stepper.component.scss'],
  standalone: true,
  imports: [
    CommonModule, // Adds *ngIf, *ngFor, and async pipe
    IonicModule   // Adds ion-header, ion-toolbar, ion-title, ion-icon
  ]
})
export class StationStepperComponent {
  @Input() pageTitle = '';
  @Output() back = new EventEmitter<void>();

  constructor(
    public stationService: StationService,
    private route: ActivatedRoute
  ) {}

ngOnInit() {}

  onBack() {
    this.back.emit();
  }
  // Add this method to handle step clicks and forward reference parameters
  onStepClick(targetRoute: string) {
    const refNum = 
      this.route.snapshot.paramMap.get('reference_number') ||
      this.route.snapshot.queryParamMap.get('reference_number');

    this.stationService.navigateTo(targetRoute, refNum || undefined);
  }
}