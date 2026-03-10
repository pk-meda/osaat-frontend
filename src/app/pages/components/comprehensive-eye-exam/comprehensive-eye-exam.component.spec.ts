import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ComprehensiveEyeExamComponent } from './comprehensive-eye-exam.component';

describe('ComprehensiveEyeExamComponent', () => {
  let component: ComprehensiveEyeExamComponent;
  let fixture: ComponentFixture<ComprehensiveEyeExamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComprehensiveEyeExamComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ComprehensiveEyeExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
