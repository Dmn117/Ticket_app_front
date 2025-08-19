import {firstValueFrom} from 'rxjs';
import {Router} from '@angular/router';
import {Component, Inject} from '@angular/core';
import {TicketStatusEs} from 'src/app/shared/enums/ticketStatus';
import {Ticket, UpdateTicket} from 'src/app/shared/models/ticket';
import {TicketService} from 'src/app/core/services/ticket.service';
import {DialogService} from 'src/app/core/services/dialog.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {SocketWebService} from 'src/app/core/services/socket-web.service';
import SocketEvents from 'src/app/shared/enums/Socket.events';
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {tick} from "@angular/core/testing";


@Component({
  selector: 'app-change-ticket-status',
  templateUrl: './change-ticket-status.component.html',
  styleUrls: ['./change-ticket-status.component.scss']
})
export class ChangeTicketStatusComponent {

  statuses: string[] = Object.keys(TicketStatusEs);
  isSubmitting: boolean = false;

  ticketForm: UntypedFormGroup = new UntypedFormGroup({
    status: new UntypedFormControl('', Validators.required),
    cancellationComment: new UntypedFormControl('')
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { ticket: Ticket, loadTicket: () => void },
    private _router: Router,
    private _dialog: DialogService,
    private _ticketService: TicketService,
    private _socketWebService: SocketWebService,
    private dialogRef: MatDialogRef<ChangeTicketStatusComponent>,
    private sweetAlert: SweetAlertComponent
  ) {
  }

  getStatusTranslation(status: string): string {
    const translation = Object.entries(TicketStatusEs).find(([_, value]) => value === status);
    return translation ? translation[0] : status;
  }

  getStatusIcon(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Abierto': 'radio_button_unchecked',
      'En Progreso': 'autorenew',
      'Pendiente': 'schedule',
      'Resuelto': 'check_circle',
      'Cerrado': 'lock',
      'Cancelado / Anulado': 'cancel'
    };
    return statusMap[status] || 'help';
  }

  getStatusClass(status: string): string {
    const classMap: { [key: string]: string } = {
      'Abierto': 'status-open',
      'En Progreso': 'status-progress',
      'Pendiente': 'status-pending',
      'Resuelto': 'status-resolved',
      'Cerrado': 'status-closed',
      'Cancelado / Anulado': 'status-cancelled'
    };
    return classMap[status] || '';
  }


  changeStatus = async (): Promise<void> => {
    if(this.ticketForm.valid ){
      try {
        const isConfirmed = await this.sweetAlert.confirmAction(
          '¿Confirmar cambio de estado?',
          '¿Estás seguro de que deseas cambiar el estado de este ticket?'
        );

        if (!isConfirmed) {
          return;
        }

        this.isSubmitting = true;

        if (this.ticketForm.invalid) {
          //console.error('El formulario es inválido');
          this._dialog.openDialogTimer('Formulario incompleto')
          this.isSubmitting = false;
          return;
        }

        const selectedStatus = this.ticketForm.get('status')?.value as keyof typeof TicketStatusEs;
        const data: Partial<UpdateTicket> = {
          status: TicketStatusEs[selectedStatus],
          justification:  this.ticketForm.get('cancellationComment')?.value || ''
        };


        const res = await firstValueFrom(
          this._ticketService.updateTicket(this.data.ticket._id, data)
        );


        this._socketWebService.emitEvent(SocketEvents.TicketChange, {
          text: `Cambio de status: ${data.status}`,
          ticket: {
            _id: this.data.ticket._id
          }
        });

        this.data.loadTicket();

        // @ts-ignore
        const translatedStatus = this.getStatusTranslation(data.status);
        this._dialog.openDialogTimer(`Cambio de status: ${translatedStatus}`);
      } catch (error) {
        console.error('Ocurrió un error al cambiar el estado:', error);
        this._dialog.openDialogTimer(`Ocurrio un error : ${error}`)
      } finally {
        this.isSubmitting = false;
        this.closedDialog();
      }
    }

  };


  closedDialog = (): void => {
    this.dialogRef.close();
  };
  protected readonly tick = tick;
}
