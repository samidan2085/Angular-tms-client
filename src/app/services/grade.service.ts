import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GradePayload {
  studentId: number;
  courseId: number;
  score: number;
}

export interface GradeResponse {
  id: number;
  studentId: number;
  courseId: number;
  score: number;
}

@Injectable({
  providedIn: 'root'
})
export class GradeService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:5178/api/v2/grades';

  postGrade(
    payload: GradePayload
  ): Observable<GradeResponse> {

    console.log('POST:', this.apiUrl);

    console.log('BODY:', payload);

    return this.http.post<GradeResponse>(
      this.apiUrl,
      payload
    );
  }
}