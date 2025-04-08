import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }
 
  getAllNewTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ticket/get/all?includesStatus=false&status=CLOSED, CANCELED`);
  }

  ///////////////////////////////
  getStatusTickets(inc:boolean, statusInc: string): Observable<any>{
    return this.http.get<any[]>(`${this.apiUrl}/ticket/get/all?includesStatus=${inc}&status=${statusInc}`);
  }
  ///////////////////////////////

  getAllNewTicketsClosed(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ticket/get/all?includesStatus=true&status=CLOSED, CANCELED`);
  }

  getAllTicketsByDepartment(departments: string[]): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/ticket/get/all?includesStatus=false&status=CLOSED, CANCELED&department=${departments}`)
  }

  getAllTicketsByDepartmentClosed(departments: string[]): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/ticket/get/all?includesStatus=true&status=CLOSED, CANCELED&department=${departments}`)
  }

  getAllTicketsByOwner(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/ticket/get/all?includesStatus=false&status=CLOSED, CANCELED&owner=${id}`);
  }

  getAllTicketsByOwnerClosed(id: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/ticket/get/all?includesStatus=true&status=CLOSED, CANCELED&owner=${id}`);
  }

  getTicket(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ticket/get/id/${id}`);
  }

  createTicket(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ticket/create`, data);
  }

  updateTicket(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/ticket/update/${id}`, data);
  }

  addItemTicket(id: string, items: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ticket/add/item/${id}`, items);
  }

  removeItemTicket(id: string, items: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ticket/remove/item/${id}`, items);
  }

  rateTicket(id: string, rate: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/ticket/rate/${id}`, rate);
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ticket/delete/${id}`);
  }


}
