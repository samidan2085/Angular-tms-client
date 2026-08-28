import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-admin-course-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-course-list.component.html',
  styleUrl: './admin-course-list.component.scss'
})
export class AdminCourseListComponent implements OnInit {

  private courseService = inject(CourseService);

  courses: Course[] = [];

  isLoading = true;

  errorMessage = '';

  ngOnInit(): void {

    console.log('ADMIN COURSE LIST STARTED');

    this.loadCourses();
  }

  loadCourses(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.courseService
      .getAll(1, 5)
      .subscribe({

        next: (response) => {

          console.log(
            'COURSE RESPONSE:',
            response
          );

          console.log(
            'COURSE DATA:',
            response.data
          );

          this.courses =
            response.data ?? [];

          // IMPORTANT
          this.isLoading = false;

          console.log(
            'isLoading:',
            this.isLoading
          );

          console.log(
            'courses:',
            this.courses
          );
        },

        error: (error) => {

          console.error(
            'COURSE ERROR:',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            'Failed to load courses.';
        }

      });
  }

  deleteCourse(id: number): void {

    if (
      !confirm(
        'Are you sure you want to delete this course?'
      )
    ) {
      return;
    }

    this.courseService
      .delete(id)
      .subscribe({

        next: () => {

          this.courses =
            this.courses.filter(
              course =>
                course.id !== id
            );

        },

        error: error => {

          console.error(
            'DELETE ERROR:',
            error
          );

          this.errorMessage =
            'Failed to delete course.';
        }

      });
  }
}