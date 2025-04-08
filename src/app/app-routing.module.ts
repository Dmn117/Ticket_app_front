import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from "./pages/home/home.component";
import {LoginComponent} from "./modules/auth/login/login.component";
import {RegisterComponent} from "./modules/auth/register/register.component";
import {AuthGuard} from "./core/guards/auth.guard";
import {Roles} from "./shared/models/roles";
import {UsersComponent} from "./modules/auth/users/users.component";
import {EditUserComponent} from "./modules/auth/edit-user/edit-user.component";
import {OrganizationsComponent} from "./modules/organizations/organizations.component";
import {DepartmentsComponent} from "./modules/departments/departments.component";
import {HelpTopicsComponent} from "./modules/help-topics/help-topics.component";
import {NewTicketsComponent} from "./modules/tickets/new-tickets/new-tickets.component";
import { ViewTicketComponent } from './modules/tickets/view-ticket/view-ticket.component';
import {ClosedTickesComponent} from "./modules/tickets/closed-tickes/closed-tickes.component";
import { RecoverPasswordComponent } from './modules/auth/recover-password/recover-password.component';
import { EvaluationsComponent } from './modules/evaluations/evaluations.component';
import SpecialPermissions from './shared/enums/SpecialPermissions';
import {IncidentsComponent} from "./modules/incidents/incidents.component";
import {MyOpenTicketsComponent} from "./modules/tickets/my-open-tickets/my-open-tickets.component";
import {MyClosedTicketsComponent} from "./modules/tickets/my-closed-tickets/my-closed-tickets.component";


// @ts-ignore
const routes: Routes = [
  //auth incluye login y register
  { path: 'login', component: LoginComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN], specialPermissions: [SpecialPermissions.createUser] } },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { roles: Roles.ADMIN, specialPermissions: [SpecialPermissions.updateUser] } },
  { path: 'edit-user:id', component: EditUserComponent, canActivate: [AuthGuard], data: { roles: Roles.ADMIN } },

  // Organizaciones
  { path: 'organizations', component: OrganizationsComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN, Roles.DIRECTOR] } },

  // Departamentos
  { path: 'departments', component: DepartmentsComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN, Roles.DIRECTOR] } },

  // Help-Topics
  { path: 'help-topics', component: HelpTopicsComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.BOSS, Roles.AGENT] } },

  // Tickets
  { path: 'tickets/new', component: NewTicketsComponent, canActivate: [AuthGuard], data: { roles: Object.keys(Roles) } },
  { path: 'tickets/view/:id', component: ViewTicketComponent, canActivate: [AuthGuard], data: { roles: Object.keys(Roles) } },
  { path: 'tickets/closed', component: ClosedTickesComponent, canActivate: [AuthGuard], data: { roles: Object.keys(Roles) } },
  { path: 'tickets/my-open-ones', component:MyOpenTicketsComponent, canActivate: [AuthGuard], data: { roles: Object.keys(Roles) } },
  { path: 'tickets/my-closed-ones', component:MyClosedTicketsComponent, canActivate: [AuthGuard], data: { roles: Object.keys(Roles) } },

  // Evaluations
  { path: 'evaluations', component: EvaluationsComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.BOSS] }},
  { path: 'incidents', component: IncidentsComponent, canActivate: [AuthGuard], data: { roles: [Roles.ADMIN, Roles.DIRECTOR, Roles.BOSS] }},


  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
