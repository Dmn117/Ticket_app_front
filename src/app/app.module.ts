import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SweetAlertComponent } from './shared/components/sweet-alert/sweet-alert.component';
import { MaterialTableComponent } from './shared/components/material-table/material-table.component';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorIntl, MatPaginatorModule} from "@angular/material/paginator";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { FormComponent } from './shared/components/form/form.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './modules/auth/login/login.component';
import {MatInputModule} from "@angular/material/input";
import {MatButton, MatButtonModule} from "@angular/material/button";
import { DialogComponent } from './shared/components/dialog/dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatCardModule} from "@angular/material/card";
import { SidenavComponent } from './shared/components/sidenav/sidenav.component';
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule} from "@angular/material/list";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import { FooterComponent } from './shared/components/footer/footer.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { RegisterComponent } from './modules/auth/register/register.component';
import {AuthInterceptor} from "./core/services/auth.interceptor";
import {MatSelectModule} from "@angular/material/select";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { UsersComponent } from './modules/auth/users/users.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { EditUserComponent } from './modules/auth/edit-user/edit-user.component';
import { OrganizationsComponent } from './modules/organizations/organizations.component';
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatToolbarModule} from "@angular/material/toolbar";
import { EditOrganizationDialogComponent } from './modules/organizations/edit-organization-dialog/edit-organization-dialog.component';
import { CreateOrganizationDialogComponent } from './modules/organizations/create-organization-dialog/create-organization-dialog.component';
import { DepartmentsComponent } from './modules/departments/departments.component';
import { CreateDepartmentDialogComponent } from './modules/departments/create-department-dialog/create-department-dialog.component';
import { EditDepartmentDialogComponent } from './modules/departments/edit-department-dialog/edit-department-dialog.component';
import { HelpTopicsComponent } from './modules/help-topics/help-topics.component';
import { CreateTopicDialogComponent } from './modules/help-topics/create-topic-dialog/create-topic-dialog.component';
import {MatLegacyChipsModule} from "@angular/material/legacy-chips";
import { EditTopicDialogComponent } from './modules/help-topics/edit-topic-dialog/edit-topic-dialog.component';
import {MAT_DATE_LOCALE} from "@angular/material/core";
import {getSpanishPaginatorIntl} from "../../i18n/spanish-paginator-intl";
import {MatMenuModule} from "@angular/material/menu";
import {NewTicketsComponent} from "./modules/tickets/new-tickets/new-tickets.component";
import { EditUserAvatarDialogComponent } from './pages/home/edit-user-avatar-dialog/edit-user-avatar-dialog.component';
import { ViewTicketComponent } from './modules/tickets/view-ticket/view-ticket.component';
import { CreateTicketsComponent } from './modules/tickets/create-tickets/create-tickets.component';
import {CreateTopicDialogHomeComponent} from "./pages/home/create-topic-dialog-home/create-topic-dialog-home.component";
import { AssignedTicketComponent } from './modules/tickets/assigned-ticket/assigned-ticket.component';
import { TransferTicketComponent } from './modules/tickets/transfer-ticket/transfer-ticket.component';
import { ChangeTicketStatusComponent } from './modules/tickets/change-ticket-status/change-ticket-status.component';
import { RateTicketComponent } from './modules/tickets/rate-ticket/rate-ticket.component';
import { ViewImageComponent } from './modules/tickets/view-image/view-image.component';
import {EditTicketComponent} from "./modules/tickets/edit-ticket/edit-ticket.component";
import { ClosedTickesComponent } from './modules/tickets/closed-tickes/closed-tickes.component';
import { RatingTicketComponent } from './modules/tickets/rating-ticket/rating-ticket.component';
import { RecoverPasswordComponent } from './modules/auth/recover-password/recover-password.component';
import { EvaluationsComponent } from './modules/evaluations/evaluations.component';
import { ViewEvaluationComponent } from './modules/evaluations/view-evaluation/view-evaluation.component';
import { IncidentsComponent } from './modules/incidents/incidents.component';
import { IncidentDialogComponent } from './modules/incidents/incident-dialog/incident-dialog.component';
import { CreateIncidentComponent } from './modules/incidents/create-incident/create-incident.component';
import { MyOpenTicketsComponent } from './modules/tickets/my-open-tickets/my-open-tickets.component';
import { MyClosedTicketsComponent } from './modules/tickets/my-closed-tickets/my-closed-tickets.component';
import {registerLocaleData} from "@angular/common";
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

@NgModule({
  declarations: [
    AppComponent,
    SweetAlertComponent,
    MaterialTableComponent,
    FormComponent,
    HomeComponent,
    LoginComponent,
    DialogComponent,
    SidenavComponent,
    FooterComponent,
    RegisterComponent,
    UsersComponent,
    EditUserComponent,
    OrganizationsComponent,
    EditOrganizationDialogComponent,
    CreateOrganizationDialogComponent,
    DepartmentsComponent,
    CreateDepartmentDialogComponent,
    EditDepartmentDialogComponent,
    HelpTopicsComponent,
    CreateTopicDialogComponent,
    EditTopicDialogComponent,
    NewTicketsComponent,
    EditUserAvatarDialogComponent,
    ViewTicketComponent,
    CreateTicketsComponent,
    CreateTopicDialogHomeComponent,
    AssignedTicketComponent,
    TransferTicketComponent,
    ChangeTicketStatusComponent,
    RateTicketComponent,
    ViewImageComponent,
    EditTicketComponent,
    ClosedTickesComponent,
    RatingTicketComponent,
    RecoverPasswordComponent,
    EvaluationsComponent,
    ViewEvaluationComponent,
    IncidentsComponent,
    IncidentDialogComponent,
    CreateIncidentComponent,
    MyOpenTicketsComponent,
    MyClosedTicketsComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatPaginatorModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,
        MatSidenavModule,
        MatListModule,
        MatExpansionModule,
        MatIconModule,
        HttpClientModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatSortModule,
        MatToolbarModule,
        MatLegacyChipsModule,
        MatMenuModule,
    ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-ES' },
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
