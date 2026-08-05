import { computed, inject } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  patchState,
  withState,
} from '@ngrx/signals';
import {
  withEntities,
  setAllEntities,
  updateEntity,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, concatMap, tap, catchError, EMPTY } from 'rxjs';
import { EnrollmentService } from '../services/enrollment';
import { Enrollment } from '../models/enrollment.model';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },

  withState({ isLoading: false, error: null as string | null }),
  withEntities<Enrollment>(),

  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((e) => e.status === 'Pending').length
    ),
    approvedCount: computed(
      () => store.entities().filter((e) => e.status === 'Approved').length
    ),
  })),

  withMethods((store, api = inject(EnrollmentService)) => ({
    // 1. Fetch initial records
    loadEnrollments: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(() =>
          api.getAll().pipe(
            tap((rows) =>
              patchState(store, setAllEntities(rows), { isLoading: false })
            ),
            catchError((err) => {
              patchState(store, { isLoading: false, error: err.message });
              return EMPTY;
            })
          )
        )
      )
    ),

    // 2. Approve specific enrollment ID
    approveEnrollment: rxMethod<string>(
      pipe(
        tap((id) => {
          patchState(
            store,
            updateEntity({ id, changes: { status: 'Approved' } })
          );
        }),
        concatMap((id) =>
          api.approve(id).pipe(
            catchError((err) => {
              // Rollback on server failure
              patchState(
                store,
                updateEntity({ id, changes: { status: 'Pending' } })
              );
              patchState(store, { error: 'Server rejected approval.' });
              return EMPTY;
            })
          )
        )
      )
    ),

    // 3. Reject specific enrollment ID (Moves back to Pending)
    rejectEnrollment: rxMethod<string>(
      pipe(
        tap((id) => {
          patchState(
            store,
            updateEntity({ id, changes: { status: 'Pending' } })
          );
        })
      )
    ),

    // Helpers for summary controls
    approveNextPending: () => {
      const pendingItem = store.entities().find((e) => e.status === 'Pending');
      if (pendingItem) {
        patchState(
          store,
          updateEntity({ id: pendingItem.id, changes: { status: 'Approved' } })
        );
      }
    },

    rejectApprovedItem: () => {
      const approvedItem = store.entities().find((e) => e.status === 'Approved');
      if (approvedItem) {
        patchState(
          store,
          updateEntity({ id: approvedItem.id, changes: { status: 'Pending' } })
        );
      }
    },
  }))
);