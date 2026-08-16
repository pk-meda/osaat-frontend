import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingController, ToastController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../services/api.service';
import { ReportService } from '../../../helpers/report.service';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss'],
  standalone: false
})
export class ReportingComponent implements OnInit {
  selectedSchool: string = '';
  schools: any[] = [];
  filteredSchools: string[] = [];
  activeTab: string = 'orders';

  metrics: any = {
    total_participants: 0,
    total_screenings: 0,
    total_dispensing: 0,
    total_refractions: 0,
    total_diagnoses: 0
  };

  constructor(
    private apiService: ApiService,
    private reportService: ReportService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadSchools();
    this.loadMetrics();
  }

  loadSchools() {
    this.apiService.getSchoolss().subscribe({
      next: (res: any) => {
        let items: any[] = Array.isArray(res) ? res : (res?.results || res?.body || []);
        this.schools = items
          .map((item: any) => typeof item === 'string' ? item : item.school_name)
          .filter((name: string) => !!name);
        this.filteredSchools = [...this.schools];
      },
      error: (err: any) => console.error('Failed to load schools:', err)
    });
  }

  loadMetrics() {
    this.reportService.getReportMetrics(this.selectedSchool).subscribe({
      next: (res: any) => { this.metrics = res; },
      error: (err: any) => console.error('Failed to load report metrics', err)
    });
  }

  filterSchools(event: any) {
    const query = (event.target.value || '').toLowerCase();
    if (!query.trim()) {
      this.filteredSchools = [...this.schools];
      return;
    }
    this.filteredSchools = this.schools.filter(school => school.toLowerCase().includes(query));
  }

  selectSchool(schoolName: string) {
    this.selectedSchool = schoolName;
    this.loadMetrics(); // Refresh counts based on school selection
  }

  segmentChanged(event: any) {
    this.activeTab = event.detail.value;
  }

  downloadActiveReport() {
    let endpoint = 'orders';
    let title = 'Spec Order Sheet';
    if (this.activeTab === 'screenings') { endpoint = 'screenings'; title = 'Screening Report'; }
    else if (this.activeTab === 'examinations') { endpoint = 'examinations'; title = 'Clinical Examinations Report'; }
    else if (this.activeTab === 'diagnoses') { endpoint = 'diagnoses'; title = 'Diagnosis & Management Report'; }

    this.downloadReportFile(endpoint, title);
  }

  async downloadReportFile(endpoint: string, reportName: string) {
    const loading = await this.loadingCtrl.create({
      message: `Generating ${reportName}...`,
      spinner: 'circles'
    });
    await loading.present();

    this.reportService.downloadReportByType(endpoint, this.selectedSchool).subscribe({
      next: (blob: Blob) => {
        loading.dismiss();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showToast(`${reportName} downloaded successfully!`, 'success');
      },
      error: (err: HttpErrorResponse | any) => {
        loading.dismiss();
        this.showToast('Failed to generate report. Please try again.', 'danger');
      }
    });
  }

  backLocation() { this.location.back(); }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'bottom' });
    await toast.present();
  }
}