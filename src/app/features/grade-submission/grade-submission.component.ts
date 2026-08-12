import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, exhaustMap, catchError, finalize, of, timeout } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GradePayload, GradeService } from '../../services/grade.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'tms-grade-submission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './grade-submission.component.html'
})
export class GradeSubmissionComponent {

  private api = inject(GradeService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  gradeForm = this.fb.group({
    studentId: [
      101,
      [Validators.required, Validators.min(1)]
    ],

    courseId: [
      302,
      [Validators.required, Validators.min(1)]
    ],

    score: [
      88,
      [
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]
    ]
  });

  isSubmitting = false;

  submissionStatus = '';

  submissionSuccess = false;

  private submitClick$ = new Subject<GradePayload>();

  constructor() {

    this.submitClick$
      .pipe(

        // Prevent multiple clicks while request is running
        exhaustMap((payload) => {

          this.isSubmitting = true;

          this.submissionSuccess = false;

          this.submissionStatus =
            'Submitting grade to server...';

          return this.api.postGrade(payload).pipe(

            // If server does not respond within 10 seconds
            timeout(10000),

            catchError((err) => {

              console.error('GRADE SUBMISSION ERROR:', err);

              let message = 'Failed to submit grade.';

              if (err.name === 'TimeoutError') {
                message =
                  'Server did not respond within 10 seconds.';
              }
              else if (err.status === 0) {
                message =
                  'Cannot connect to the API. Make sure the .NET API is running.';
              }
              else if (err.error?.detail) {
                message = err.error.detail;
              }
              else if (err.error?.message) {
                message = err.error.message;
              }
              else if (err.message) {
                message = err.message;
              }

              this.submissionSuccess = false;

              this.submissionStatus =
                `❌ ${message}`;

              // Keep the submit stream alive
              return of(null);
            }),

            // ALWAYS turn off spinner
            finalize(() => {
              this.isSubmitting = false;
            })
          );
        }),

        takeUntilDestroyed(this.destroyRef)

      )
      .subscribe({

        next: (result) => {

          if (!result) {
            return;
          }

          console.log('GRADE SAVED:', result);

          this.submissionSuccess = true;

          this.submissionStatus =
            `✅ Grade saved successfully! Record ID: ${result.id}`;
        }

      });
  }

  onSubmit(): void {

    if (this.gradeForm.invalid) {

      this.gradeForm.markAllAsTouched();

      this.submissionStatus =
        'Please enter valid grade information.';

      return;
    }

    const value = this.gradeForm.getRawValue();

    const payload: GradePayload = {

      studentId: Number(value.studentId),

      courseId: Number(value.courseId),

      score: Number(value.score)

    };

    console.log('Sending grade:', payload);

    this.submitClick$.next(payload);
  }
}