import { Component, inject, OnInit } from '@angular/core';
import { EnrollmentStore } from '../../store/enrollment.store';

@Component({
  selector: 'tms-enrollment-list',
  standalone: true,
  templateUrl: './enrollment-list.component.html',
})
export class EnrollmentListComponent implements OnInit {
  store = inject(EnrollmentStore);

  ngOnInit() {
    this.store.loadEnrollments(); // Loads entities into the shared store
  }

  onApprove(id: string) {
    this.store.approveEnrollment(id); // Changes status to 'Approved'
  }

  onReject(id: string) {
    this.store.rejectEnrollment(id); // Changes status to 'Pending'
  }
}