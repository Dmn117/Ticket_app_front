import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtén el token del localStorage o de donde lo guardes
    const token = localStorage.getItem('token');

    // Clona la petición y agrega el encabezado de autorización
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

        // Verificar Token
      if (this.authService.validateExpirationToken()) {
        localStorage.removeItem('token'); // Remove token from localStorage
        window.location.href = '/login';
      }
    }

    return next.handle(authReq);
  }
}
