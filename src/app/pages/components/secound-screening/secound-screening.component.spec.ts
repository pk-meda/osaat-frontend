import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SecoundScreeningComponent } from './secound-screening.component';

describe('SecoundScreeningComponent', () => {
  let component: SecoundScreeningComponent;
  let fixture: ComponentFixture<SecoundScreeningComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SecoundScreeningComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SecoundScreeningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export { SecoundScreeningComponent };
