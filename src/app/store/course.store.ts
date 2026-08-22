import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withMethods,
  withState
} from '@ngrx/signals';

import {
  removeEntity,
  setAllEntities,
  withEntities
} from '@ngrx/signals/entities';

import { catchError, EMPTY } from 'rxjs';

import { CourseService } from '../services/course.service';

export interface Course {
  id: number;
  [key: string]: any;
}

export interface CourseState {
  error: string | null;
}

export const CourseStore = signalStore(
  { providedIn: 'root' },

  withState<CourseState>({
    error: null
  }),

  withEntities<Course>(),

  withMethods((store, svc = inject(CourseService)) => ({

    deleteCourse(id: number) {

      // Save current courses before deleting
      const previousSnapshot = store.entities();

      // Optimistically remove from UI
      patchState(
        store,
        removeEntity(id)
      );

      // Delete from backend
      svc.delete(id).pipe(

        catchError((err) => {

          console.error('Delete course failed:', err);

          // Restore previous courses
          patchState(
            store,
            setAllEntities(previousSnapshot)
          );

          // Set error
          patchState(store, {
            error:
              'Cannot delete course: active student enrollments exist.'
          });

          return EMPTY;
        })

      ).subscribe();
    }

  }))
);