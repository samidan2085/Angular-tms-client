import { computed, inject } from '@angular/core';

import { signalStore, withComputed, withMethods, patchState, withState } from '@ngrx/signals';

import { withEntities, setAllEntities, updateEntity } from '@ngrx/signals/entities';

import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { pipe, concatMap, tap, catchError, EMPTY, switchMap } from 'rxjs';

import { Enrollment } from '../models/enrollment.model';

import { EnrollmentService } from '../services/enrollment';
import { LiveSyncService } from '../services/live-sync';
import { Title } from '@angular/platform-browser';

export const EnrollmentStore = signalStore(
  { providedIn: 'root' },

  // =====================================================
  // STATE
  // =====================================================

  withState({
    isLoading: false,

    error: null as string | null,
  }),

  // =====================================================
  // ENTITIES
  // =====================================================

  withEntities<Enrollment>(),

  // =====================================================
  // COMPUTED VALUES
  // =====================================================

  withComputed((store) => ({
    pendingCount: computed(
      () => store.entities().filter((enrollment) => enrollment.status === 'Pending').length,
    ),

    approvedCount: computed(
      () => store.entities().filter((enrollment) => enrollment.status === 'Approved').length,
    ),

    rejectedCount: computed(
      () => store.entities().filter((enrollment) => enrollment.status === 'Rejected').length,
    ),
  })),

  // =====================================================
  // METHODS
  // =====================================================

  withMethods(
    (
      store,

      api = inject(EnrollmentService),

      sync = inject(LiveSyncService),
    ) => ({
      // =================================================
      // 1. LOAD ENROLLMENTS
      // =================================================

      loadEnrollments: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, {
              isLoading: true,
              error: null,
            });
          }),

          concatMap(() =>
            api.getAll().pipe(
              tap((rows: any[]) => {
                const normalizedRows = (rows ?? []).map((row: any) => ({
                  id: String(row.id ?? row.enrollmentId ?? ''),
                  studentId: row.studentId ?? row.student?.id ?? 0,
                  studentName: row.studentName ?? row.student?.name ?? row.student?.fullName ?? '',
                  courseId: row.courseId ?? row.course?.id ?? 0,
                  courseName:
                    row.courseName ??
                    row.course?.Title ??
                    row.course?.title ??
                    row.course?.name ??
                    '',
                  status: normalizeStatus(row.status),
                  enrolledAt: row.enrolledAt ?? '',
                }));

                patchState(store, setAllEntities(normalizedRows), {
                  isLoading: false,
                  error: null,
                });
              }),

              catchError((err) => {
                console.error('Failed to load enrollments:', err);

                patchState(store, {
                  isLoading: false,
                  error: err?.error?.message ?? err?.message ?? 'Failed to load enrollments.',
                });

                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // =================================================
      // 2. APPROVE ENROLLMENT
      // =================================================

      approveEnrollment: rxMethod<string>(
        pipe(
          tap((id) => {
            console.log('Approving enrollment:', id);

            patchState(
              store,
              updateEntity({
                id,
                changes: {
                  status: 'Approved',
                },
              }),
            );
          }),

          concatMap((id) =>
            api.approve(id).pipe(
              tap(() => {
                console.log('Enrollment approved:', id);
              }),

              catchError((err) => {
                console.error('Approval failed:', err);

                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: {
                      status: 'Pending',
                    },
                  }),
                );

                patchState(store, {
                  error: err?.error?.message ?? err?.message ?? 'Server rejected the approval.',
                });

                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // =================================================
      // 3. REJECT ENROLLMENT
      // =================================================

      rejectEnrollment: rxMethod<string>(
        pipe(
          tap((id) => {
            patchState(
              store,
              updateEntity({
                id,
                changes: {
                  status: 'Rejected',
                },
              }),
            );
          }),

          concatMap((id) =>
            api.reject(id).pipe(
              tap(() => {
                console.log('Enrollment rejected:', id);
              }),

              catchError((err) => {
                console.error('Rejection failed:', err);

                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: {
                      status: 'Approved',
                    },
                  }),
                );

                patchState(store, {
                  error:
                    err?.error?.message ?? err?.message ?? 'Server rejected the rejection request.',
                });

                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      // =================================================
      // 4. SIGNALR LIVE UPDATES
      // =================================================

      listenForLiveUpdates: rxMethod<void>(
        pipe(
          // ---------------------------------------------
          // CONNECT
          // ---------------------------------------------

          tap(() => {
            console.log('Connecting to SignalR...');

            sync.connect();
          }),

          // ---------------------------------------------
          // RECEIVE EVENTS
          // ---------------------------------------------

          switchMap(() => sync.events$),

          // ---------------------------------------------
          // UPDATE STORE
          // ---------------------------------------------

          tap((event) => {
            console.log('SignalR enrollment update:', event);

            patchState(
              store,

              updateEntity({
                id: event.id,

                changes: {
                  status: normalizeStatus(event.status),
                },
              }),
            );
          }),
        ),
      ),

      // =================================================
      // 5. APPROVE NEXT PENDING
      // =================================================

      approveNextPending: () => {
        const pendingEnrollment = store
          .entities()
          .find((enrollment) => enrollment.status === 'Pending');

        if (!pendingEnrollment) {
          console.log('No pending enrollment found.');

          return;
        }

        patchState(
          store,

          updateEntity({
            id: pendingEnrollment.id,

            changes: {
              status: 'Approved',
            },
          }),
        );
      },

      // =================================================
      // 6. REJECT FIRST APPROVED
      // =================================================

      rejectApprovedItem: () => {
        const approvedEnrollment = store
          .entities()
          .find((enrollment) => enrollment.status === 'Approved');

        if (!approvedEnrollment) {
          console.log('No approved enrollment found.');

          return;
        }

        patchState(
          store,

          updateEntity({
            id: approvedEnrollment.id,

            changes: {
              status: 'Rejected',
            },
          }),
        );
      },
    }),
  ),
);

// =======================================================
// STATUS NORMALIZATION
// =======================================================

function normalizeStatus(status: string): 'Pending' | 'Approved' | 'Rejected' {
  switch (status?.trim().toLowerCase()) {
    case 'approved':
      return 'Approved';

    case 'rejected':
      return 'Rejected';

    case 'pending':
    default:
      return 'Pending';
  }
}
