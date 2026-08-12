import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent,
      ),
  },
  {
    path: 'enroll',
    loadComponent: () =>
      import('./features/enrollment-form/enrollment-form').then((m) => m.EnrollmentFormComponent),
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
 {
    path: 'dashboard-summary',
    loadComponent: () =>
      import('./features/dashbord-summary/dashbord-summary.component').then(
        (m) => m.DashboardSummaryComponent
      ),
  },
  {
path: 'dashboard1',
loadComponent: () =>
import('./features/instructor-dashboard/instructor-dashboard.component')
.then(m => m.InstructorDashboardComponent)
},
{
path: 'enrollments',
loadComponent: () =>
import('./features/enrollment-list/enrollment-list.component')
.then(m => m.EnrollmentListComponent)
},
{
path: 'grade-submission',
loadComponent: () =>
import('./features/grade-submission/grade-submission.component')
.then(m => m.GradeSubmissionComponent)
}
];
