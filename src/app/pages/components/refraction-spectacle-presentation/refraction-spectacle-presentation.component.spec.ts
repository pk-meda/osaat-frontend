import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RefractionSpectaclePresentationComponent } from './refraction-spectacle-presentation.component';

describe('RefractionSpectaclePresentationComponent', () => {
  let component: RefractionSpectaclePresentationComponent;
  let fixture: ComponentFixture<RefractionSpectaclePresentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RefractionSpectaclePresentationComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RefractionSpectaclePresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
