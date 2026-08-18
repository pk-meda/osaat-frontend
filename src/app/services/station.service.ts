import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface Station {
  id: string;
  name: string;
  description: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class StationService {
  public stations: Station[] = [
    { id: 'screening', name: 'Participant Reg', description: 'Initial Registration', route: '/layout/first-screening' },
    { id: 'complaint', name: 'Complaints', description: 'Patient Complaints', route: '/layout/complaint' },
    { id: 'etest', name: 'E-Test', description: 'Orientation-Based', route: '/layout/eye_exam' },
    { id: 'va', name: 'VA Chart', description: 'Visual Acuity', route: '/layout/measurement-visual' },
    { id: 'refractionRespresentation', name: 'Refraction Spectacle Presentation', description: 'Refraction Spectacle Presentation', route: '/layout/refraction-spectacle-presentation' },
    { id: 'refraction', name: 'Refraction & Examination', description: 'Refraction & Examination', route: '/layout/refraction' },
    { id: 'dispensing', name: 'Dispensing', description: 'Dispensing Summary', route: '/layout/dispensing' },
  ];

  public activeIndex$ = new BehaviorSubject<number>(0);

  constructor(private router: Router) {
    this.updateActiveIndex(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActiveIndex(event.urlAfterRedirects || event.url);
      });
  }

  private updateActiveIndex(fullUrl: string) {
    // Strip query parameters (?ref=...) and matrix parameters (;ref=...)
    const cleanPath = fullUrl.split('?')[0].split(';')[0];

    const foundIndex = this.stations.findIndex(s => {
      // Check if the current route matches either exact route or route prefix (e.g. /layout/first-screening/SS-123)
      return cleanPath === s.route || cleanPath.startsWith(s.route + '/');
    });

    if (foundIndex !== -1) {
      this.activeIndex$.next(foundIndex);
    }
  }

  public navigateTo(targetRoute: string, referenceNumber?: string) {
    if (referenceNumber) {
      this.router.navigate([targetRoute], { queryParams: { reference_number: referenceNumber } });
    } else {
      this.router.navigate([targetRoute]);
    }
  }
}