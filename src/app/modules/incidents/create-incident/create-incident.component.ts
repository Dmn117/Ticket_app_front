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
    title: new UntypedFormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(100)
    ]),
    description: new UntypedFormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(1000)
    ]),
    severity: new UntypedFormControl('', [
      Validators.required
    ]),
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
        this.markFormGroupTouched(this.incidentForm);
        this._dialogService.openDialog(
          `Por favor, complete todos los campos requeridos correctamente`
        );
        return;
      }

      const agent: User = this.incidentForm.get('agent')?.value as User;
      const id: string = this._authService.getId() || '';
      const severity = parseInt(this.incidentForm.get('severity')?.value);

      const data: IncidentEntry = {
        title: this.incidentForm.get('title')?.value.trim(),
        description: this.incidentForm.get('description')?.value.trim(),
        severity: severity,
        author: id,
        agent: agent._id
      };

      const severityText = this.getSeverityText(severity);
      const isConfirmed = await this._sweetAlert.confirmAction(
        '¿Crear Ticket de Soporte?',
        `¿Estás seguro de crear este ticket con prioridad ${severityText} y asignarlo a ${agent.firstName} ${agent.lastName}?`
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
      
      const errorMessage = err.error?.message || 'Error al crear el ticket. Inténtelo nuevamente.';
      this._dialogService.openDialog(errorMessage);
    }
    finally {
      this.isSubmitting = false;
    }
  };

  private markFormGroupTouched(formGroup: UntypedFormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private getSeverityText(severity: number): string {
    if (severity <= 2) return 'BAJA';
    if (severity <= 5) return 'MEDIA';
    if (severity <= 8) return 'ALTA';
    return 'CRÍTICA';
  }


  closedDialog = (): void => {
    this._dialogRef.close();
  };
}
