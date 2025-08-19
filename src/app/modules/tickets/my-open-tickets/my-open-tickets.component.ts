import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {AuthService} from "../../../core/services/auth.service";
import {TicketService} from "../../../core/services/ticket.service";
import {HelpTopicsService} from "../../../core/services/help-topic.service";
import {DepartmentService} from "../../../core/services/department.service";
import {forkJoin, catchError, of} from "rxjs";
import {DialogService} from "../../../core/services/dialog.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {CreateTicketsComponent} from "../create-tickets/create-tickets.component";
import {MatSort} from "@angular/material/sort";

import {Status} from "../../../shared/models/status";
import {MaterialTableComponent} from "../../../shared/components/material-table/material-table.component";

@Component({
  selector: 'app-my-open-tickets',
  templateUrl: './my-open-tickets.component.html',
  styleUrls: ['./my-open-tickets.component.scss']
})
export class MyOpenTicketsComponent implements OnInit, AfterViewInit{
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MaterialTableComponent) MaterialTableComponent?: MaterialTableComponent;

  statusSelect: Status[] = [
    { label: 'Todos', value: '' },
    { label: 'Nuevo', value: 'OPEN' },
    { label: 'Asignado', value: 'ASSIGNED' },
    { label: 'En proceso', value: 'IN_PROCESS' },
    { label: 'En espera', value: 'ON_HOLD' },
    { label: 'Detenido', value: 'STOPPED' },
    { label: 'Cancelado', value: 'CANCELED' },
    { label: 'Cerrado', value: 'CLOSED' }
  ];

  statusFilter: string = '';

  dataSourceMat = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'number',
    'title',
    'helpTopic',
    'owner',
    'department',
    'status',
    'assignedTo',
    'createdAt',
    'acciones'
  ];

  idUser =  localStorage.getItem('id');
  userLogged = [];
  ticketFull: any[] = [];

  constructor(
    private _authService: AuthService,
    private _ticketService: TicketService,
    private _helpTopicsServices: HelpTopicsService,
    private _departmentServices: DepartmentService,
    private _dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router,
    private sweetAlert: SweetAlertComponent
  ) {
  }
   ngOnInit() {
    this.loadUser();
    
   }

   ngAfterViewInit() {
      // @ts-ignore
     this.dataSourceMat.sort = this.sort;
   }

   loadUser() {
    // @ts-ignore
     this._authService.getUserById(this.idUser).subscribe(response => {
      this.userLogged = response.user;

      this.loadTickets();
    })
   }

  loadTickets(customFetch?: any) {
    // @ts-ignore
    // const userRole = this.userLogged.role;
    // @ts-ignore
    const userId = this.userLogged._id;
    // @ts-ignore
    // const departmentsArray = this.userLogged.departments;
    // const departmentsString = encodeURIComponent(departmentsArray.join(', '));

    const fetchFunction = customFetch ?? null

    ///////////////////////////////////////////////////////////////////////////////////////
    this._ticketService.getAllTicketsByOwner(userId).pipe(
      catchError(error => {
        console.error('Error en la llamada de getAllTicketsByOwner:', error.message);
        // Si ocurre un error, retornar un array vacío para continuar
        return of({ tickets: [] });
      })
    ).subscribe(response1 => {
      // @ts-ignore
      const ticketsByOwner = response1.tickets || [];

      // Hacer las demás llamadas a los servicios en paralelo
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

        // Mapear los tickets con la información adicional
        const ticketsWithDetails = ticketsByOwner.map((ticket: any) => {
          // @ts-ignore
          const department = departments.find(dep => dep._id === ticket.department);
          // @ts-ignore
          const helpTopic = helpTopics.find(topic => topic._id === ticket.helpTopic);
          // @ts-ignore
          const owner = owners.find(user => user._id === ticket.owner);
          // @ts-ignore
          const assigned = owners.find(us => us._id === ticket.assignedTo);
          // @ts-ignore
          let expirationStatus = 'No tiene tiempo';
          if (helpTopic && helpTopic.expIn && ticket.assignedAt) {
            const dateAsign = new Date(ticket.assignedAt).getTime();
            const dateNow = new Date().getTime();

            const expirationTime = dateAsign + helpTopic.expIn * 60 * 1000;
            expirationStatus = expirationTime < dateNow ? 'Restrasado' : 'A tiempo';

          }


          return {
            ...ticket,
            departmentName: department ? department.name : 'Desconocido',
            helpTopicName: helpTopic ? helpTopic.name : 'Tema no encontrado',
            helpTopicExp: expirationStatus,
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
      console.error('Error: no se cargaron los tickets por propietario: ', error);
    });
  }
//////////////////////////////////////////////////////////////////////////////////////////////
  

   addTicket() {
    const dialogRef = this.dialog.open(CreateTicketsComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-backdrop'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refrescar la tabla si se creó un ticket
        this.ngOnInit();
      }
    });
  }

  viewTicket(id: string) {
    this.router.navigate([`/tickets/view/${id}`]);
  }

  applyStatusFilter() {
    this.loadTickets(this._ticketService.getStatusTickets(true, this.statusFilter));
    if (this.MaterialTableComponent) {
      this.MaterialTableComponent.filterValue = "";
    }
    
    // Aplica el filtro: Trim para quitar espacios y UpperCase para normalizar valores
    this.dataSourceMat.filter = this.statusFilter.trim().toUpperCase();
    
  }


}
