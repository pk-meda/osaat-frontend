import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LoadingController, ToastController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../../services/api.service'; // Adjust path as needed
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
  filteredSchools: string[] = []; // Stores filtered results for searchbar

  constructor(
    private apiService: ApiService,        // 👈 Used to fetch backend schools list
    private reportService: ReportService,  // 👈 Used to download CSV
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadSchools();
  }

  loadSchools() {
    this.apiService.getSchoolss().subscribe({
      next: (res: any) => {
        let items: any[] = Array.isArray(res) ? res : (res?.results || res?.body || []);
        
        // Extract school_name from objects
        this.schools = items
          .map((item: any) => typeof item === 'string' ? item : item.school_name)
          .filter((name: string) => !!name);

        this.filteredSchools = [...this.schools]; // Initial copy for rendering
      },
      error: (err: any) => {
        console.error('Failed to load live schools:', err);
      }
    });
  }

  // Filters school array in real-time as user types
  filterSchools(event: any) {
    const query = (event.target.value || '').toLowerCase();
    if (!query.trim()) {
      this.filteredSchools = [...this.schools];
      return;
    }
    this.filteredSchools = this.schools.filter(school => 
      school.toLowerCase().includes(query)
    );
  }

  selectSchool(schoolName: string) {
    this.selectedSchool = schoolName;
  }

  backLocation() {
    this.location.back();
  }

  async downloadReport() {
    const loading = await this.loadingCtrl.create({
      message: 'Generating Spec Order Sheet...',
      spinner: 'circles'
    });
    await loading.present();

    this.reportService.downloadSpecOrderSheet(this.selectedSchool).subscribe({
      next: (blob: Blob) => {
        loading.dismiss();
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Spec_Order_Sheet_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Report downloaded successfully!', 'success');
      },
      error: (err: HttpErrorResponse | any) => { // Explicit type fixes TS7006
        loading.dismiss();
        console.error(err);

        let errorMsg = 'Failed to generate report. Please try again.';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }

        this.showToast(errorMsg, 'danger');
      }
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}