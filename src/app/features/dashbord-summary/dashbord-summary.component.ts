import { Component, inject, OnInit } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';
@Component({
  selector: 'tms-dashboard-summary',
  standalone: true,
  templateUrl: './dashbord-summary.component.html',
})
export class DashboardSummaryComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments();
  }

  onApprove() {
    this.store.approveNextPending();
  }

  onReject() {
    this.store.rejectApprovedItem();
  }
}
