import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,pipe,tap } from 'rxjs';

import {
  Enrollment,

} from '../models/enrollment.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:5178/api/v2/enrollments';


  // =====================================================
  // GET ALL ENROLLMENTS
  // =====================================================

  getAll(): Observable<Enrollment[]> {
    return this.http
    .get<Enrollment[]>(this.baseUrl )
    .pipe(
      tap(data => {
        console.log('🔥 ACTUAL API DATA:', data);
      })
    );
   
  }


  // =====================================================
  // APPROVE
  // =====================================================

  approve(id: string): Observable<void> {

    return this.http.post<void>(
      `${this.baseUrl}/${id}/approve`,
      {}
    );

  }


  // =====================================================
  // REJECT
  // =====================================================

  reject(id: string): Observable<void> {

    return this.http.put<void>(
      `${this.baseUrl}/${id}/reject`,
      {}
    );

  }

}