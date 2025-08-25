import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {OrganizationService} from "../../../core/services/organization.service";
import {DepartmentService} from "../../../core/services/department.service";
import {Organization} from "../../../shared/models/organization";
import {Department} from "../../../shared/models/department";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HelpTopicsService} from "../../../core/services/help-topic.service";
import {firstValueFrom} from "rxjs";
import {TicketService} from "../../../core/services/ticket.service";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {Router} from "@angular/router";
import {DialogService} from "../../../core/services/dialog.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-create-tickets',
  templateUrl: './create-tickets.component.html',
  styleUrls: ['./create-tickets.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateTicketsComponent implements OnInit{

  owner = localStorage.getItem('id');
  isSubmitting: boolean = false;

  ticketForm: FormGroup;

  noMatch: boolean = false;


  constructor(
    private _ticketService: TicketService,
    private fb: FormBuilder,
    private sweetAlert: SweetAlertComponent,
    private router: Router,
    private dialog: DialogService,
    private dialogRef: MatDialogRef<CreateTicketsComponent>
  ) {
    this.ticketForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      owner: [''],
    })
  }

  ngOnInit() {}

  createTicket = async(): Promise<void> => {
    try {
      this.isSubmitting = true;
      this.ticketForm.value.owner = this.owner;

      const confirmed = await this.sweetAlert.confirmAction(
        'Crear Ticket de Soporte',
        `¿Estás seguro de crear este ticket con la información actual?`
      );

      if (confirmed){
        const createTicket = this.ticketForm.value

        const ticketCreate = await firstValueFrom(this._ticketService.createTicket(createTicket));

        if (ticketCreate) {
          this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
            this.router.navigate(['tickets/my-open-ones']).then(() => {
              this.dialogRef.close(true);
              this.dialog.openDialog(`${ticketCreate.message}`);
            });
          });
        }
        console.log(ticketCreate);
      }

    }
    catch (error){
      console.error('Error al crear el ticket: ', error);
      this.dialog.openDialog('Error al crear el ticket. Por favor, intenta nuevamente.');
    }
    finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  closedDialog(): void {
    this.dialogRef.close()
  }
}
