import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CurrentMedicalTreatmentComponent } from './current-medical-treatment.component';

describe('CurrentMedicalTreatmentComponent', () => {
  let component: CurrentMedicalTreatmentComponent;
  let fixture: ComponentFixture<CurrentMedicalTreatmentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CurrentMedicalTreatmentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentMedicalTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
