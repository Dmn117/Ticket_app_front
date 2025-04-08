import { firstValueFrom } from 'rxjs';
import { AddItem, Ticket, Tickets } from 'src/app/shared/models/ticket';
import { Component, Inject, OnInit } from '@angular/core';
import { ResAllUsers, User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TicketService } from 'src/app/core/services/ticket.service';
import { Router } from '@angular/router';
import { Roles } from 'src/app/shared/models/roles';
import { SocketWebService } from 'src/app/core/services/socket-web.service';
import SocketEvents from 'src/app/shared/enums/Socket.events';
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";

@Component({
  selector: 'app-assigned-ticket',
  templateUrl: './assigned-ticket.component.html',
  styleUrls: ['./assigned-ticket.component.scss'],
})
export class AssignedTicketComponent implements OnInit {

  users: User[] = [];
  isSubmitting: boolean = false;

  deapartmentId: any = '';

  ticketForm: UntypedFormGroup = new UntypedFormGroup({
    assignedTo: new UntypedFormControl('', Validators.required),
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { ticket: Ticket | Tickets, loadTicket: () => void },
    private _router: Router,
    private _dialog: DialogService,
    private _userService: AuthService,
    private _ticketService: TicketService,
    private _socketWebService: SocketWebService,
    private dialogRef: MatDialogRef<AssignedTicketComponent>,
    private sweetAlert: SweetAlertComponent
  ) {

  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers = async (): Promise<void> => {
    try {
      const departmentId: string = typeof this.data.ticket.department  === 'object'
        ? this.data.ticket.department._id
        : this.data.ticket.department;

      const res: ResAllUsers = await firstValueFrom(
        this._userService.getUsersWithParams(
          `?enabled=true&includesDepartments=true&departments=${departmentId}&includesRoles=false&role=${Roles.USER}`
        )
      );

      this.users = res.users;
    } catch (error) {
      console.log(error);
    }
  };

  assignedTo = async (): Promise<void> => {
    try {
      const isConfirmed = await this.sweetAlert.confirmAction(
        '¿Confirmar asignación?',
        '¿Estás seguro de que deseas asignar este ticket a otro agente?'
      );

      if (!isConfirmed) {
        return;
      }

      this.isSubmitting = true;

      if (this.ticketForm.invalid) {
        console.error('El formulario es inválido');
        this._dialog.openDialogTimer('Formulario inválido');
        this.isSubmitting = false;
        return;
      }

      const assignedToId = this.ticketForm.get('assignedTo')?.value;

       const assignedUser = this.users.find(user => user._id === assignedToId);

      const addItem: Partial<AddItem> = {
        assignedTo: assignedToId,
      };

      const res = await firstValueFrom(
        this._ticketService.addItemTicket(this.data.ticket._id, addItem)
      );

      this._socketWebService.emitEvent(SocketEvents.TicketChange, {
        text: `Asignación de Ticket a Usuario: ${assignedToId}`,
        ticket: { _id: this.data.ticket._id }
      });

       const assignedUserName = assignedUser
        ? `${assignedUser.firstName} ${assignedUser.lastName}`
        : 'Desconocido';

      this._dialog.openDialogTimer(
        `Asignación de ticket hecha correctamente: ${assignedUserName}`
      );

      this.data.loadTicket();
    } catch (error) {
      console.error('Ocurrió un error al asignar el ticket:', error);
      this._dialog.openDialogTimer(`Ocurrió un error: ${error}`);
    } finally {
      this.isSubmitting = false;
      this.closedDialog();
    }
  };


  closedDialog = (): void => {
    this.dialogRef.close();
  };
}
