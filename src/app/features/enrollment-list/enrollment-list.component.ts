import {
  Component,
  viewChild,
  effect,
  inject
} from '@angular/core';

import {
  MatTableModule,
  MatTableDataSource
} from '@angular/material/table';

import {
  MatPaginatorModule,
  MatPaginator
} from '@angular/material/paginator';

import {
  MatSortModule,
  MatSort
} from '@angular/material/sort';

import {
  EnrollmentStore
} from '../../store/enrollment.store';

import {
  Enrollment
} from '../../models/enrollment.model';


@Component({

  selector: 'tms-enrollment-list',

  standalone: true,

  imports: [

    MatTableModule,

    MatPaginatorModule,

    MatSortModule

  ],

  templateUrl:
    './enrollment-list.component.html',

  styleUrl:
    './enrollment-list.component.scss'

})
export class EnrollmentListComponent {


  // =====================================================
  // STORE
  // =====================================================

  readonly store =
    inject(EnrollmentStore);


  // =====================================================
  // TABLE COLUMNS
  // =====================================================

  readonly displayedColumns = [

    'studentName',

    'courseName',

    'status',

    'actions'

  ];


  // =====================================================
  // DATA SOURCE
  // =====================================================

  readonly dataSource =
    new MatTableDataSource<Enrollment>();


  // =====================================================
  // PAGINATOR
  // =====================================================

  readonly paginator =
    viewChild.required(MatPaginator);


  // =====================================================
  // SORT
  // =====================================================

  readonly sort =
    viewChild.required(MatSort);


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor() {


    // ---------------------------------------------
    // STORE → TABLE
    // ---------------------------------------------

    effect(() => {

      const enrollments =
        this.store.entities();


      console.log(
        'Store enrollments:',
        enrollments
      );


      this.dataSource.data =
        enrollments;

    });


    // ---------------------------------------------
    // PAGINATOR + SORT
    // ---------------------------------------------

    effect(() => {

      this.dataSource.paginator =
        this.paginator();


      this.dataSource.sort =
        this.sort();

    });


    // ---------------------------------------------
    // LOAD DATA
    // ---------------------------------------------

    this.store.loadEnrollments();


    // ---------------------------------------------
    // SIGNALR
    // ---------------------------------------------

    this.store.listenForLiveUpdates();

  }

}