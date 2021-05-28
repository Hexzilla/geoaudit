import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class UploadService {

  constructor(
    private http: HttpClient) {}

  post(data: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_URL}/upload`,
      data
    );
  }
}
