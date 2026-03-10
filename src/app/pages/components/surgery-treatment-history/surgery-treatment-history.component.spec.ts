import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurgeryTreatmentHistoryComponent } from './surgery-treatment-history.component';

describe('SurgeryTreatmentHistoryComponent', () => {
  let component: SurgeryTreatmentHistoryComponent;
  let fixture: ComponentFixture<SurgeryTreatmentHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SurgeryTreatmentHistoryComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurgeryTreatmentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
