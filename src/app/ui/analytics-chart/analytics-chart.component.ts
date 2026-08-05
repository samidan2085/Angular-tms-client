import { Component, Input } from '@angular/core';

@Component({
  selector: 'tms-analytics-chart',
  standalone: true,
  imports: [],
  templateUrl: './analytics-chart.component.html',
  styleUrl: './analytics-chart.component.scss',
})
export class AnalyticsChartComponent {
  @Input() data: unknown[] = [];
}
