import { Routes } from '@angular/router';
import { AdminCourseListComponent } from './features/admin-course-list/admin-course-list.component';
import { roleGuard } from './guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

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
  
 // Login page
  {
    path: 'login',
    component: LoginComponent
  },
  
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
},
 {
  path: 'admin',
  children: [

    {
      path: 'courses',
      loadComponent: () =>
        import('./features/admin-course-list/admin-course-list.component')
          .then(m => m.AdminCourseListComponent)
    }

  ]
}
];
