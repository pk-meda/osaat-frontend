import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MeasurementVisualAcuityComponent } from './measurement-visual-acuity.component';

describe('MeasurementVisualAcuityComponent', () => {
  let component: MeasurementVisualAcuityComponent;
  let fixture: ComponentFixture<MeasurementVisualAcuityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasurementVisualAcuityComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MeasurementVisualAcuityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
