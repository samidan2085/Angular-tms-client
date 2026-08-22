import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  Course,
  CourseDetail,
  PagedResponse
} from '../models/course.model';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  // Angular HTTP client
  private http = inject(HttpClient);

  // API base URL
  private readonly base = `${environment.apiUrl}/courses`;

  // GET all courses
  getAll(page = 1, pageSize = 3) {

    return this.http
      .get<PagedResponse<Course>>(this.base, {
        params: {
          page: page.toString(),
          pageSize: pageSize.toString()
        }
      })
      .pipe(
        map((p) => p.data)
      );
  }

  // GET course by ID
  getById(id: string) {

    return this.http.get<CourseDetail>(
      `${this.base}/${id}`
    );
  }

  // DELETE course
  delete(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.base}/${id}`
    );
  }
}