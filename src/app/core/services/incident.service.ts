import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { CreateEvaluationsInBulk, EvaluationEntry, EvaluationQueryParams } from 'src/app/shared/models/evaluation';
import { IncidentEntry, IncidentQueryParams } from 'src/app/shared/models/incidence';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {

  private apiUrl = `${environment.apiUrl}/incidence`;

  private stringParams = (params: Partial<IncidentQueryParams>): string => {
    const values = Object.entries(params);

    if (values.length === 0) return '';

    let strParams: string = '?';

    values.forEach(([key, value]) => {
        strParams += `${key}=${value}&`;
    });

    return strParams;
  };

  constructor(private http: HttpClient) { }


  getAll = (params: Partial<IncidentQueryParams>): Observable<any> => {
    const strParams = this.stringParams(params);

    if (strParams)
        return this.http.get<any>(`${this.apiUrl}/get/all${strParams}`)
    else
        return this.http.get<any>(`${this.apiUrl}/get/all`)
  };

  getAllBoss = (idBoss: string) => {
    return this.http.get<any>(`${this.apiUrl}/get/boss/${idBoss}`);
  }

  getById = (id: string): Observable<any> => {
    return this.http.get<any>(`${this.apiUrl}/get/id/${id}`);
  };


  create = (data: Partial<IncidentEntry>): Observable<any> => {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  };


  update = (id: string, data: Partial<IncidentEntry>): Observable<any> => {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, data);
  };
}
