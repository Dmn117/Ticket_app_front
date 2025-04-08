import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class HelpTopicsService {
  private apiUrl = `${environment.apiUrl}/help-topic`;

  constructor(private http: HttpClient) {}

  getHelpTopics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/all`);
  }

  getHelpTopic(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/id/${id}`);
  };

  getHelpTopicsByDepartments(departments: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/get/all?enabled=true&includesDepartments=true&department=${departments}`);
  };

  createHelpTopic(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  updateHelpTopic(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }


  disableHelpTopic(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/disable/${id}`, {});
  }

  enableHelpTopic(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/enable/${id}`, {});
  }

}
