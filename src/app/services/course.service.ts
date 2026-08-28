import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  Course
} from '../models/course.model';

export interface CourseResponse {

  data: Course[];

  page?: number;

  pageSize?: number;

  totalCount?: number;

}

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private http = inject(HttpClient);

  // ⚠️ CHANGE PORT TO YOUR .NET API PORT
  private apiUrl =
    'http://localhost:5178/api/v2/courses';


  getAll(
    page: number = 1,
    pageSize: number = 100
  ): Observable<CourseResponse> {

    const params =
      new HttpParams()
        .set('page', page)
        .set('pageSize', pageSize);

    console.log(
      'REQUESTING COURSES:',
      this.apiUrl
    );

    return this.http.get<CourseResponse>(
      this.apiUrl,
      {
        params
      }
    );
  }


  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}