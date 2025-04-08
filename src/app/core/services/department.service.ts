import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private apiUrl = `${environment.apiUrl}/department`;
  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/all`);
  }

  getDepartmentsWithOrganization(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/all?populateOrganization=true`);
  }

  getDepartmentsEnabled(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get/all?enabled=true`);
  }

  getDepartmentsByOrganization(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/all?enabled=true&organization=${id}`);
  };

  enableDepartment(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/enable/${id}`, {});
  }

  disableDepartment(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/disable/${id}`, {});
  }

  updateDepartment(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, data);
  }

  createDepartment(data: any) {
    return this.http.post(`${this.apiUrl}/create/`, data);
  }

  getDepartmentById(departmentId: string) {
    return this.http.get<any>(`${this.apiUrl}/get/id/${departmentId}`);
  }
}
