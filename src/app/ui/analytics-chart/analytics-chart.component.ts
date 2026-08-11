import { Component, computed, input } from '@angular/core';
import { Enrollment } from '../../models/enrollment.model';

@Component({
  selector: 'tms-analytics-chart',
  standalone: true,
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss'
})
export class AnalyticsChartComponent {
  data = input.required<Enrollment[]>();

  // Counts
  approvedCount = computed(() => this.data().filter((e) => e.status === 'Approved').length);
  pendingCount = computed(() => this.data().filter((e) => e.status === 'Pending').length);
  rejectedCount = computed(() => this.data().filter((e) => e.status === 'Rejected').length);

  // Height scaling: 25px per item up to 160px max
  approvedHeight = computed(() => Math.min(160, Math.max(20, this.approvedCount() * 25)));
  pendingHeight = computed(() => Math.min(160, Math.max(20, this.pendingCount() * 25)));
  rejectedHeight = computed(() => Math.min(160, Math.max(20, this.rejectedCount() * 25)));
}