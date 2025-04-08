import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {


  private apiUrl = `${environment.apiUrl}/organization`;
  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/all`);
  }

  getOrganizationsEnabled(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get/all?enabled=true`);
  }

  enableOrganization(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/enable/${id}`, {});
  }

  disableOrganization(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/disable/${id}`, {});
  }

  updateOrganization(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  createOrganization(data: any) {
    return this.http.post(`${this.apiUrl}/create/`, data);
  }

}
