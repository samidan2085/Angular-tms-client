import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],

  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);

  auth = inject(AuthService);

  isLoading = false;
  errorMessage = '';

  loginForm = this.fb.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ]

  });

  onSubmit(): void {

    console.log('LOGIN BUTTON CLICKED');

    this.errorMessage = '';

    if (this.loginForm.invalid) {

      console.log('FORM INVALID');

      this.loginForm.markAllAsTouched();

      return;
    }

    const email =
      this.loginForm.controls.email.value ?? '';

    const password =
      this.loginForm.controls.password.value ?? '';

    console.log('Email:', email);
    console.log('Sending login request...');

    this.isLoading = true;

    this.auth.login({
      email: email,
      password: password
    })
    .pipe(
      finalize(() => {

        console.log('LOGIN REQUEST FINISHED');

        this.isLoading = false;

      })
    )
    .subscribe({

      next: (response) => {

        console.log('LOGIN SUCCESS:', response);

        console.log(
          'Token:',
          response.token
        );

        console.log(
          'Role:',
          response.role
        );

        // ================================
        // ADMIN
        // ================================

        if (this.auth.hasRole('Admin')) {

          console.log(
            'ADMIN → /admin/courses'
          );

          this.router.navigate(
            ['/admin/courses']
          )
          .then(success => {

            console.log(
              'NAVIGATION SUCCESS:',
              success
            );

          })
          .catch(error => {

            console.error(
              'NAVIGATION ERROR:',
              error
            );

          });

          return;
        }

        // ================================
        // INSTRUCTOR
        // ================================

        if (this.auth.hasRole('Instructor')) {

          console.log(
            'INSTRUCTOR → /instructor'
          );

          this.router.navigate(
            ['/instructor']
          );

          return;
        }

        // ================================
        // STUDENT
        // ================================

        if (this.auth.hasRole('Student')) {

          console.log(
            'STUDENT → /student'
          );

          this.router.navigate(
            ['/student']
          );

          return;
        }

        // ================================
        // NO ROLE
        // ================================

        console.error(
          'No valid role returned.'
        );

        this.errorMessage =
          'Login successful, but no valid role was assigned.';

      },

      error: (error) => {

        console.error(
          'LOGIN ERROR:',
          error
        );

        if (error.status === 401) {

          this.errorMessage =
            'Invalid email or password.';

        }
        else if (error.status === 423) {

          this.errorMessage =
            'Your account is locked.';

        }
        else if (error.status === 0) {

          this.errorMessage =
            'Cannot connect to the TMS API. Check that the API is running.';

        }
        else {

          this.errorMessage =
            error.error?.detail ??
            error.error?.message ??
            'Login failed. Please try again.';

        }

      },

      complete: () => {

        console.log(
          'LOGIN REQUEST COMPLETED'
        );

      }

    });
  }
}