import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { CreateEvaluationsInBulk, EvaluationEntry, EvaluationQueryParams } from 'src/app/shared/models/evaluation';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private apiUrl = `${environment.apiUrl}/evaluation`;

  private stringParams = (params: Partial<EvaluationQueryParams>): string => {
    const values = Object.entries(params);
    
    if (values.length === 0) return '';

    let strParams: string = '?';

    values.forEach(([key, value]) => {
        strParams += `${key}=${value}&`;
    });

    return strParams;
  };

  constructor(private http: HttpClient) { }


  getAll = (params: Partial<EvaluationQueryParams>): Observable<any> => {
    const strParams = this.stringParams(params);
    
    if (strParams) 
        return this.http.get<any>(`${this.apiUrl}/get/all${strParams}`)
    else
        return this.http.get<any>(`${this.apiUrl}/get/all`)
  };


  getById = (id: string): Observable<any> => {
    return this.http.get<any>(`${this.apiUrl}/get/id/${id}`);
  };


  getBossId = (id: string): Observable<any> => {
    return this.http.get<any>(`${this.apiUrl}/get/boss/${id}`);
  };


  create = (data: Partial<EvaluationEntry>): Observable<any> => {
    return this.http.post<any>(`${this.apiUrl}/create`, data);
  };


  createInBulk = (data: CreateEvaluationsInBulk): Observable<any> => {
    return this.http.post<any>(`${this.apiUrl}/create/in-bulk`, data);
  };


  update = (id: string, data: Partial<EvaluationEntry>): Observable<any> => {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, data);
  };

}
