import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment.development";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  createAvatarFile(owner: string, folderName: string, data: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', data);
    return this.http.post(`${this.apiUrl}/file/create/${owner}/${folderName}`, formData);
  }

  updateFile(id: string, folderName: string, data: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', data);
    return this.http.put(`${this.apiUrl}/file/update/${id}/${folderName}`, formData)
  }


  getPublicUrl(id: string): string {
    return `${this.apiUrl}/file/get/public/file/${id}`;
  };


  downloadPublicFile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/file/get/public/file/${id}`, { responseType: 'blob' });
  };
}
