import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DepartmentService } from 'src/app/core/services/department.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { HelpTopicsService } from 'src/app/core/services/help-topic.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { SocketWebService } from 'src/app/core/services/socket-web.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import SocketEvents from 'src/app/shared/enums/Socket.events';
import { Department, ResAllDepartments } from 'src/app/shared/models/department';
import { HelpTopic, ResAllHelpTopic } from 'src/app/shared/models/helpTopic';
import { Organization, ResAllOrganization } from 'src/app/shared/models/organization';
import { AddItem, Ticket } from 'src/app/shared/models/ticket';
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";

@Component({
  selector: 'app-transfer-ticket',
  templateUrl: './transfer-ticket.component.html',
  styleUrls: ['./transfer-ticket.component.scss']
})
export class TransferTicketComponent implements OnInit {

  isSubmitting: boolean = false;

  organizations: Organization[] = [];
  departments: Department[] = [];
  helpTopics: HelpTopic[] = [];

  filteredDepartments: Department[] = [];
  filteredHelpTopics: HelpTopic[] = [];

  ticketForm: UntypedFormGroup = new UntypedFormGroup({
    organization: new UntypedFormControl('', Validators.required),
    department: new UntypedFormControl('', Validators.required),
    helpTopic: new UntypedFormControl('', Validators.required)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { ticket: Ticket, loadTicket: () => void },
    private _router: Router,
    private _dialog: DialogService,
    private _ticketService: TicketService,
    private _socketWebService: SocketWebService,
    private _helpTopicService: HelpTopicsService,
    private _departmentService: DepartmentService,
    private _organizationService: OrganizationService,
    private dialogRef: MatDialogRef<TransferTicketComponent>,
    private sweetAlert : SweetAlertComponent,
  ) { };


  ngOnInit(): void {
    this.loadData();
  };


  loadData = async (): Promise<void> => {
    try {
      const promises: [
        ResAllOrganization,
        ResAllDepartments,
        ResAllHelpTopic
      ] = await Promise.all([
        firstValueFrom(this._organizationService.getOrganizations()),
        firstValueFrom(this._departmentService.getDepartments()),
        firstValueFrom(this._helpTopicService.getHelpTopics())
      ]);

      this.organizations = promises[0].organizations;
      this.departments = promises[1].departments;
      this.helpTopics = promises[2].helpTopics;
    }
    catch (error) {
      console.log(error);
    }
  };


  onOrganizationSelected = (): void => {
    this.filteredDepartments = this.departments.filter(department => {
      return department.organization === this.ticketForm.get('organization')?.value;
    })
  };


  onDepartmentSelected = (): void => {
    this.filteredHelpTopics = this.helpTopics.filter(helpTopic => {
      return helpTopic.department === this.ticketForm.get('department')?.value;
    })
  };


  filterHelpTopics = (event: Event): void => {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredHelpTopics = this.helpTopics.filter(help => help.name.toLowerCase().includes(query));
  }

  displayHelpTopic = (id: string | null): string => {
    if (!this.filteredHelpTopics) return '';

    const helpTopic = this.filteredHelpTopics.find(ht => ht._id === id);
    return helpTopic ? helpTopic.name : '';
  };


  displayHelpTopicUpperCase = (id: string | null): string => {
    return this.displayHelpTopic(id).toUpperCase();
  }


  transferTicket = async (): Promise<void> => {
    try {
       const isConfirmed = await this.sweetAlert.confirmAction(
        '¿Confirmar transferencia?',
        '¿Estás seguro de que deseas transferir este ticket a un nuevo tema de ayuda?'
      );

      if (!isConfirmed) {
        return;
      }

      this.isSubmitting = true;

      if (this.ticketForm.invalid) {
        console.error('El formulario es inválido');
        this._dialog.openDialogTimer('Formulario incompleto')
        this.isSubmitting = false;
        return;
      }

      const addItem: Partial<AddItem> = {
        helpTopic: this.ticketForm.get('helpTopic')?.value
      };

      const res = await firstValueFrom(
        this._ticketService.addItemTicket(this.data.ticket._id, addItem)
      );

      this._socketWebService.emitEvent(SocketEvents.TicketChange, {
        text: `Ticket transferido a tema de ayuda: ${addItem.helpTopic}`,
        ticket: { _id: this.data.ticket._id }
      });

      this._dialog.openDialogTimer(
        `Ticket transferido a tema de ayuda: ${this.displayHelpTopic(addItem.helpTopic || '')}`
      );

      this.data.loadTicket();
    } catch (error) {
      console.error('Ocurrió un error al transferir el ticket:', error);
      this._dialog.openDialogTimer(`Ocurrio un error: ${error}`)
    } finally {
      this.isSubmitting = false;
      this.closedDialog();
    }
  };



  closedDialog = (): void => {
    this.dialogRef.close();
  };
}
