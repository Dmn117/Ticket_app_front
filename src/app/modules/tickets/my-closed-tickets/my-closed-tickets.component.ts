import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {TicketService} from "../../../core/services/ticket.service";
import {AuthService} from "../../../core/services/auth.service";
import {HelpTopicsService} from "../../../core/services/help-topic.service";
import {DepartmentService} from "../../../core/services/department.service";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {DialogService} from "../../../core/services/dialog.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {RatingTicketComponent} from "../rating-ticket/rating-ticket.component";

@Component({
  selector: 'app-my-closed-tickets',
  templateUrl: './my-closed-tickets.component.html',
  styleUrls: ['./my-closed-tickets.component.scss']
})
export class MyClosedTicketsComponent implements OnInit{

  dataSourceMat = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'number',
    'title',
    'helpTopic',
    'owner',
    'department',
    'status',
    'assignedTo',
    'completedAt',
    'acciones'
  ];

  idUser = localStorage.getItem('id');

  userLogged = [];
  ticketFull: any[] =[];

  constructor(
    private _ticketService: TicketService,
    private _authService: AuthService,
    private _helpTopicsServices: HelpTopicsService,
    private _departmentServices: DepartmentService,
    private sweetAlert: SweetAlertComponent,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private _router: Router
  ) {
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    // @ts-ignore
    this._authService.getUserById(this.idUser).subscribe(response => {
      //console.log('Respuesta recibida: ', response)
      this.userLogged = response.user;

      //console.log(this.userLogged);

      this.loadTickets();
    }, error => {
      console.log('Error al cargar al usuario: ', error);
    })
  }

  loadTickets(){
    // Obtener los tickets por departamento

    // @ts-ignore
    const userId = this.userLogged._id;
    // @ts-ignore
    const departmentsArray = this.userLogged.departments;
    const departmentsString = encodeURIComponent(departmentsArray.join(', '));
    this._ticketService.getAllTicketsByOwnerClosed(userId).subscribe(response => {
      console.log(departmentsArray)
      // @ts-ignore
      const tickets = response.tickets || [];

      // Utilizar forkJoin para hacer múltiples llamadas a servicios en paralelo
      forkJoin({
        departments: this._departmentServices.getDepartments(),
        helpTopics: this._helpTopicsServices.getHelpTopics(),
        owners: this._authService.getAllUsers()
      }).subscribe(results => {
        // @ts-ignore
        const departments = results.departments.departments || [];
        const helpTopics = results.helpTopics.helpTopics || [];
        // @ts-ignore
        const owners = results.owners.users || [];

        // Mapear tickets con sus departamentos
        // @ts-ignore
        const ticketsWithDetails = tickets.map(ticket => {
          // @ts-ignore
          const department = departments.find(dep => dep._id === ticket.department);
          // @ts-ignore
          const helpTopic = helpTopics.find(topic => topic._id === ticket.helpTopic);
          // @ts-ignore
          const owner = owners.find(user => user._id === ticket.owner);
          // @ts-ignore
          const assigned = owners.find(us => us._id === ticket.assignedTo);

          return {
            ...ticket,
            departmentName: department ? department.name : 'Desconocido',
            helpTopicName: helpTopic ? helpTopic.name : 'Tema no encontrado',
            ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Propietario no encontrado',
            assignedName: assigned ? `${assigned.firstName} ${assigned.lastName}` : 'Sin asignar'
          };
        });

        // Asignar los datos a la tabla
        this.ticketFull = ticketsWithDetails;
        this.dataSourceMat.data = this.ticketFull;
        console.log(this.dataSourceMat.data);
      }, error => {
        console.log('Error al cargar los datos adicionales: ', error);
      });
    }, error => {
      console.error('Error: no se cargaron los tickets: ', error);
    });
  }

  viewTicket(id: string) {
    this._router.navigate([`/tickets/view/${id}`]);
  };

  ratingTicket(data: any){
    const dialogRef =  this.dialog.open(RatingTicketComponent, {
      width: '600px',
      data,
    })
  }

  viewCancelation(_id: any) {
    const viewClaim = this.sweetAlert.showInfoAlert('Motivo de cancelación ' , _id)
  }

}
