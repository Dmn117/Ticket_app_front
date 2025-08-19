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

  organizations: Organization[] = [];
  departments: Department[] = [];
  helpTopics: any[] = [];
  departmentSelected: any[] = [];
  filteredHelpTopics: any[] = [];

  noMatch: boolean = false;


  constructor(
    private _organizationService: OrganizationService,
    private _departmentService: DepartmentService,
    private _helpTopicService: HelpTopicsService,
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
      organization: ['', Validators.required],
      department: ['', Validators.required],
      helpTopic: ['', Validators.required]
    })

    this.displayHelpTopic = this.displayHelpTopic.bind(this);
  }

  ngOnInit() {
    this._organizationService.getOrganizationsEnabled().subscribe(response => {
      // @ts-ignore
      this.organizations = response.organizations || [];
    });
  }


  filterHelpTopics(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredHelpTopics = this.helpTopics.filter(help => help.name.toLowerCase().includes(query));

    this.noMatch = this.filteredHelpTopics.length === 0 && query.length > 0;
  }


  displayHelpTopic(id: string | null): string {
    if (!this.filteredHelpTopics) return '';

    const helpTopic = this.filteredHelpTopics.find(ht => ht._id === id);
    return helpTopic ? helpTopic.name : '';
  }


  onOrganizationChange(organizationId: string): void {
    if (organizationId) {
      this._departmentService.getDepartmentsEnabled().subscribe(response => {
        // @ts-ignore
        this.departments = response.departments?.filter(dept => dept.organization === organizationId) || [];
      });

    }
  }


  onDepartmentChange(departmentId: string): void {
    if (departmentId) {
      this._helpTopicService.getHelpTopics().subscribe(response => {
        // @ts-ignore
        this.helpTopics = response.helpTopics?.filter(top => top.department === departmentId) || [];
        this.filteredHelpTopics = [...this.helpTopics];
      });
    }
  }

  createTicket = async(): Promise<void> => {
    try {
      this.isSubmitting = true;
      this.ticketForm.value.owner = this.owner;

      delete this.ticketForm.value.organization;

      const departmentName = await firstValueFrom(this._departmentService.getDepartmentById(this.ticketForm.value.department));

      const confirmed = await this.sweetAlert.confirmAction(
        'Crear Ticket de Soporte',
        `¿Estás seguro de crear este ticket para el departamento de ${departmentName.department.name}?`
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
