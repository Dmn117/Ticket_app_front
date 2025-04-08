import {Component} from '@angular/core';
import {MenuItem} from "../../models/menu-item";
import {Router} from "@angular/router";
import {AuthService} from "../../../core/services/auth.service";
import {environment} from "../../../../environments/environment.development";
import {UserServiceService} from "../../../core/services/user-service.service";
import { UserStateService } from 'src/app/core/services/user-state.service';
import { Roles } from '../../models/roles';
import SpecialPermissions from '../../enums/SpecialPermissions';
import {HttpErrorResponse} from "@angular/common/http";


@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {

  constructor(private router: Router,
              private authService: AuthService,
              private userService: UserServiceService,
              private userStateService: UserStateService,
            ) {
  }

  ngOnInit() {
    const handleError = (error: HttpErrorResponse) => {
      if (error.status === 401) {
        this.authService.validateSession();
      } else {
        console.error('Error loading data:', error.message);
      }
    };

    this.loadUserData();
    this.userService.getAvatarUrl().subscribe(url => {
      if (url) {
        this.imgAvatar = url;
      }
    });

    this.getMenuItems();
  }

  private apiUrl = `${environment.apiUrl}/file/get/public/file`;

  opened = true;
  userData: any;
  imgAvatar: string = '';

  menuItems: MenuItem[] = [
    {
      label: 'Inicio',
      route: '/home'
    },
    {
      label: 'Mis tickets',
      subItems: [
        {label: 'Nuevos', route: '/tickets/my-open-ones'},
        {label: 'Cerrados', route: '/tickets/my-closed-ones'}
      ]
    }
  ];


  getMenuItems () {
    const role: string = this.authService.getRol() || '';
    const specialPermissions: string[] = this.authService.getSpecialPermissions();
    const mainRoles: string[] = [Roles.ADMIN];
    const bossRoles: string[] = [Roles.ADMIN, Roles.BOSS];
    const operationalRoles: string[] = [Roles.ADMIN, Roles.BOSS, Roles.AGENT];

    const configurationItems: MenuItem = {
      label: 'Configuracion',
      subItems: []
    };

    const userItems: MenuItem = {
      label: 'Usuarios',
      subItems: []
    };

    const TicketsItems: MenuItem = {
      label: 'Tickets',
      subItems: []
    }

    const evaluationItems: MenuItem = {
      label: 'Evaluaciones / Incidencias',
      subItems: []
    };

    if (operationalRoles.includes(role)) {
      TicketsItems.subItems?.push(
        {label: 'Nuevos', route: '/tickets/new'},
        {label: 'Cerrados', route: '/tickets/closed'}
      );
    }

    if (bossRoles.includes(role)) {
      configurationItems.subItems?.push(
        { label: 'temas de ayuda', route: '/help-topics' },
        {label: 'organizaciones', route: '/organizations'},
        {label: 'departamentos', route: '/departments'},
      );
    }

    if (bossRoles.includes(role)) {
      evaluationItems.subItems?.push(
        {label: 'evaluaciones', route: '/evaluations'},
        {label: 'incidencias', route: '/incidents'}
      );


    }

    if (role === Roles.ADMIN || specialPermissions.includes(SpecialPermissions.createUser)) {
      userItems.subItems?.push(
        {label: 'crear usuario', route: '/register'},
        {label: 'ver usuarios', route: '/users'}
      );


    }

    if ((userItems.subItems?.length || 0) > 0) {
      this.menuItems.splice(1, 0, userItems);
    }

    if ((TicketsItems.subItems?.length || 0) > 0) {
      this.menuItems.splice(3, 0, TicketsItems);
    }

    if ((evaluationItems.subItems?.length || 0) > 0) {
      this.menuItems.splice(4, 0, evaluationItems);
    }

    if ((configurationItems.subItems?.length || 0) > 0) {
      this.menuItems.splice(5, 0, configurationItems);
    }


  };


  toggleSidenav() {
    this.opened = !this.opened;
  }

  viewProfile() {
    this.router.navigate(['/home']);
  }

  loadUserData() {
    const userId = localStorage.getItem('id')
    // @ts-ignore
    this.authService.getUserById(userId).subscribe(user => {
      this.userData = user;
      this.imgAvatar = `${this.apiUrl}/${this.userData.user.avatar}`;
      console.log(this.imgAvatar)
    });
  }


  logout() {
    this.userStateService.logout();
    this.router.navigate(['/login']);
  }
}
