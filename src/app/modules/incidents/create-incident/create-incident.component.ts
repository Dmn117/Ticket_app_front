import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { IncidentService } from 'src/app/core/services/incident.service';
import { SweetAlertComponent } from 'src/app/shared/components/sweet-alert/sweet-alert.component';
import { Incidence, IncidentEntry } from 'src/app/shared/models/incidence';
import { Roles } from 'src/app/shared/models/roles';
import { User, UserQueryParams } from 'src/app/shared/models/user';

@Component({
  selector: 'app-create-incident',
  templateUrl: './create-incident.component.html',
  styleUrls: ['./create-incident.component.scss']
})
export class CreateIncidentComponent  implements OnInit {

  users: User[] = [];

  isSubmitting: boolean = false;

  incidentForm: UntypedFormGroup = new UntypedFormGroup({
    title: new UntypedFormControl('', Validators.required),
    description: new UntypedFormControl('', Validators.required),
    severity: new UntypedFormControl('', Validators.required),
    agent: new UntypedFormControl('', Validators.required),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { loadIncidents: Function },
    private _dialog: MatDialog,
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _sweetAlert: SweetAlertComponent,
    private _incidentService: IncidentService,
    private _dialogRef: MatDialogRef<CreateIncidentComponent>
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }


  validateSession = (error: HttpErrorResponse): void => {
    if (error.status === 401) {
      this._authService.validateSession();
      this.closedDialog();
    }
  };


  loadUsers = async (): Promise<void> => {
    try {
      const boss: string = this._authService.getId() || '';
      const role: string = this._authService.getRol() || '';

      const params: Partial<UserQueryParams> = { role: Roles.AGENT };

      if (role !== Roles.ADMIN) {
        params.boss = boss,
        params.enabled = true
      }

      const res = await firstValueFrom(
        this._authService.getAll(params)
      );

      this.users = res.users;
    }
    catch (error) {
      this.validateSession(error as HttpErrorResponse);
      console.log(error);
    }
  };


  createIncidence = async (): Promise<void> => {
    try {
      this.isSubmitting = true;

      if (this.incidentForm.invalid) {
        this._dialogService.openDialog(
          `Advertencia: Favor de llenar todos los campos obligatorios`
        );

        return;
      }

      const agent: User = this.incidentForm.get('agent')?.value as User;
      const id: string = this._authService.getId() || '';

      const data: IncidentEntry = {
        title: this.incidentForm.get('title')?.value,
        description: this.incidentForm.get('description')?.value,
        severity: this.incidentForm.get('severity')?.value,
        author: id,
        agent: agent._id
      };

      const isConfirmed = await this._sweetAlert.confirmAction(
        '¿Confirmar Calificación?',
        `¿Estás seguro de registrar esta incidencia al agente ${agent.firstName} ${agent.lastName}?`
      );

      if (!isConfirmed) return;

      const res = await firstValueFrom(
        this._incidentService.create(data)
      );

      this.data.loadIncidents(id);
      this.closedDialog();
    }
    catch (error) {
      let err = error as HttpErrorResponse;
      console.log(error);
      this.validateSession(err);
      this._dialogService.openDialog(err.error.message);
    }
    finally {
      this.isSubmitting = false;
    }
  };


  closedDialog = (): void => {
    this._dialogRef.close();
  };
}
