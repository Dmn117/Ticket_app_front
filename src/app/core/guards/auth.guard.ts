import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from "../services/auth.service";
import {Injectable} from "@angular/core";
import { UserStateService } from '../services/user-state.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate{

  loggedIn: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private userStateService: UserStateService
  ) {
    this.userStateService.loggedIn$.subscribe(state => this.loggedIn = state);
  }


  itsAllowedByRoles(roles: string[], role: string): boolean {
    if (roles.length === 0) return true;

    return roles.includes(role);
  }


  itsAllowedByPermissions(allowedSPs: string[], specialPermissions: string[]): boolean {
    if (allowedSPs.length === 0) return false;

    return specialPermissions.filter(sp => allowedSPs.includes(sp)).length > 0;
  };

  private redirectIfNeeded(): void {
    const currentUrl = window.location.href;

    // Verifica si la URL contiene el puerto y si no está ya en tickets.connect
    if (currentUrl.includes('82.197.95.73:22227') && !currentUrl.includes('tickets.dominio.com.mx')) {
      const newUrl = currentUrl.replace('82.197.95.73:22227', 'tickets.dominio.com.mx');
      window.location.href = newUrl;  // Redirige
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.redirectIfNeeded();

    const rol = this.authService.getRol();
    const token = this.authService.getToken();
    const specialPermissions = this.authService.getSpecialPermissions();

    if (!this.loggedIn) return false;

    if(!rol || !token){
      this.router.navigate(['/login']);
      localStorage.clear()

      return false
    }

    const itsAllowedByRoles = this.itsAllowedByRoles(
      route.data['roles'] || [],
      rol
    );

    const itsAllowedBySPs = this.itsAllowedByPermissions(
      route.data['specialPermissions'] || [],
      specialPermissions
    );

    if (!itsAllowedByRoles && !itsAllowedBySPs){
        this.router.navigate(['/home']);
        return false
    }

    return true
  }
}


