import {Observable} from "rxjs";
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment.development";
import { MessageCreate, MessageUpdate } from "src/app/shared/models/message";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  createMessage = (message: Partial<MessageCreate>): Observable<any> => {
    return this.http.post(`${this.apiUrl}/message/create`, message);
  };

  updateMessage = (id: string, message: Partial<MessageUpdate>): Observable<any> => {
    return this.http.put(`${this.apiUrl}/message/update/${id}`, message);
  };



}
