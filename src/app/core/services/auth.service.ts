import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { RecoverPassword, UserQueryParams } from 'src/app/shared/models/user';
import { jwtDecode } from 'jwt-decode';
import { UserStateService } from './user-state.service';
import { Router } from '@angular/router';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}`;

  private stringParams = (params: Partial<UserQueryParams>): string => {
    const values = Object.entries(params);

    if (values.length === 0) return '';

    let strParams: string = '?';

    values.forEach(([key, value]) => {
      let formattedValue = value;

      if (Array.isArray(value)) formattedValue = value.join(', ');

      strParams += `${key}=${formattedValue}&`;
    });

    return strParams;
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private _dialogService: DialogService,
    private userStateService: UserStateService,
  ) { }


  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/login`, { email, password });
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/get/all`);
  }

  getAll = (params: Partial<UserQueryParams>): Observable<any> => {
    const strParams = this.stringParams(params);

    if (strParams)
      return this.http.get<any>(`${this.apiUrl}/user/get/all${strParams}`)
    else
      return this.http.get<any>(`${this.apiUrl}/user/get/all`)
  };

  getUsersWithParams(params: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/user/get/all${params}`);
  }

  getAllUsersEnabled(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/get/all?enabled=true`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/get/id/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/create`, userData);
  }

  validateVerificationCode(email: string, verificationCode: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/validate/user/${email}`, { verificationCode });
  }

  activateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/enable/${id}`, id);
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/disable/${id}`, id);
  }

  sendVerificationCode(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/send/verification-code/${email}`, email);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/update/${id}`, userData);
  }

  recoverPassword(email: string, data: RecoverPassword): Observable<any> {
    return this.http.patch(`${this.apiUrl}/user/recover/password/${email}`, data);
  }

  getId(): string | null {
    return localStorage.getItem('id');
  }

  getRol(): string | null {
    return localStorage.getItem('Rol');
  }

  getSpecialPermissions(): string[] {
    return localStorage.getItem('specialPermissions')?.split(',') || [];
  };

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getDepartments(): string[] {
    return localStorage.getItem('departments')?.split(',') || [];
  }

  validateExpirationToken = (): boolean => {
    const token = this.getToken();

    if (!token) return true;

    try {
      const payload = jwtDecode(token);
      const currentDate = new Date().getTime();

      return ((payload.exp || 0) * 1000) < currentDate;
    } catch (error) {
      console.error(error)
      return true;
    }

    
  };

  validateSession = (): void => {
    if (this.validateExpirationToken()) {

      this._dialogService.openDialog(`Sesión expirada, es necesario volver a iniciar sesión`);

      this.userStateService.logout();
      this.router.navigate(['/login']);
    }
  }
}
