import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {TicketService} from "../../../core/services/ticket.service";
import {AuthService} from "../../../core/services/auth.service";
import {HelpTopicsService} from "../../../core/services/help-topic.service";
import {DepartmentService} from "../../../core/services/department.service";
import {catchError, firstValueFrom, forkJoin, of} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {CreateTicketsComponent} from "../create-tickets/create-tickets.component";
import { Router } from '@angular/router';
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {DialogService} from "../../../core/services/dialog.service";
import {EditTicketComponent} from "../edit-ticket/edit-ticket.component";
import {Ticket} from "src/app/shared/models/ticket";
import {AssignedTicketComponent} from "../assigned-ticket/assigned-ticket.component";
import {MatSort} from "@angular/material/sort";
import {Status} from "../../../shared/models/status";
import {MaterialTableComponent} from "../../../shared/components/material-table/material-table.component";

@Component({
  selector: 'app-new-tickets',
  templateUrl: './new-tickets.component.html',
  styleUrls: ['./new-tickets.component.scss']
})
export class NewTicketsComponent implements OnInit, AfterViewInit{
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

  dataSourceMat =  new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'number',
    'title',
    'helpTopic',
    'owner',
    'department',
    'status',
    'assignedTo',
    'createdAt',
    'expIn',
    'acciones'
  ]

  idUser = localStorage.getItem('id');
  roleUser = localStorage.getItem('Rol');

  userLogged = [];
  ticketFull: any[] =[];

  constructor(
    private _ticketService: TicketService,
    private _authService: AuthService,
    private _helpTopicsServices: HelpTopicsService,
    private _departmentServices: DepartmentService,
    private dialog: MatDialog,
    private _router: Router,
    private sweetAlert: SweetAlertComponent,
    private dialogService: DialogService
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
      //console.log('Respuesta recibida: ', response)
      this.userLogged = response.user;

      //console.log(this.userLogged);

      this.loadTickets();
    }, error => {
      console.log('Error al cargar al usuario: ', error);
    })
  }

  loadTickets(customFetch?: any) {
    // @ts-ignore
    const userRole = this.userLogged.role;
    // @ts-ignore
    const userId = this.userLogged._id;
    // @ts-ignore
    const departmentsArray = this.userLogged.departments;
    const departmentsString = encodeURIComponent(departmentsArray.join(', '));

    const fetchFunction = customFetch ?? (() => this._ticketService.getAllTicketsByDepartment(departmentsArray))

    if(userRole !==  'ADMIN'){
      // @ts-ignore
      fetchFunction.subscribe(response1 => {
        // Llamar al segundo endpoint, manejando posibles errores
        // @ts-ignore
        this._ticketService.getAllTicketsByOwner(userId).pipe(
          catchError(error => {
            console.error('Error en la llamada de getAllTicketsByOwner:', error.message);
            // Si ocurre un error, retornar un array vacío para continuar
            return of({ tickets: [] });
          })
        ).subscribe(response2 => {

          // Obtener tickets del primer endpoint
          // @ts-ignore
          const ticketsByDepartment = response1.tickets || [];

          // Obtener tickets del segundo endpoint (o un array vacío si hubo error)
          // @ts-ignore
          const ticketsByOwner = response2.tickets || [];

          // Combinar los tickets
          const combinedTickets = [...ticketsByDepartment, ...ticketsByOwner];

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
            const ticketsWithDetails = combinedTickets.map(ticket => {
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
      }, (error: any) => {
        console.error('Error: no se cargaron los tickets por departamento: ', error);
      });
    } else {

    // @ts-ignore
    this._ticketService.getAllNewTickets().subscribe(response => {
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

          // @ts-ignore
          let expirationStatus = 'Falta asignar';
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
            ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Propietario no encontrado',
            assignedName: assigned ? `${assigned.firstName} ${assigned.lastName}` : 'Sin asignar',
            helpTopicExp:expirationStatus
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
  }

  viewTicket(id: string) {
    this._router.navigate([`/tickets/view/${id}`]);
  };

  deleteTicket = async(id: string): Promise<void> => {
    try {
      const confirmed = await this.sweetAlert.confirmAction(
        '¿Estás seguro que deseas borrar el ticket?',
        'Esta accion borrara el ticket'
      );

      if (confirmed){
        const ticketDelete = await firstValueFrom(this._ticketService.deleteTicket(id));

        if (ticketDelete){
          // Recargar los tickets para actualizar la tabla
          this.loadTickets();
          
          // Actualizar el datasource inmediatamente para mejor UX
          this.dataSourceMat.data = this.ticketFull.filter(ticket => ticket._id !== id);
          
          // Mostrar mensaje de éxito
          this.dialogService.openDialog(`${ticketDelete.message}`)
        }
      }
    }
    catch (error){
      console.error('Error al eliminar ticket:', error);
      this.dialogService.openDialog('Error al eliminar el ticket');
    }
  }

  editTicket(data: any): void {
    const dialogRef = this.dialog.open(EditTicketComponent, {
      width: '400px',
      data: {
        id: data._id,
        title: data.title,
        description: data.description
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result){
        const updateTicket: any = {};

        if (result.title !== data.title){
          updateTicket.title = result.title;
        }

        if (result.description !== data.description){
          updateTicket.description = result.description;
        }

        console.log(data._id)

        if (Object.keys(updateTicket).length > 0){
          const confirmed = await this.sweetAlert.confirmAction(
            '¿Estás seguro de que deseas guardar los cambios?',
            'Esta acción actualizara la información del ticket'
          );

          if (confirmed){
            this._ticketService.updateTicket(data._id, updateTicket).subscribe({
              next: () => {
                this.loadUser();
                this.dialogService.openDialogTimer('Ticket actualizado con éxito');
              }, error: () => {
                this.dialogService.openDialogTimer('Error al actualizar el ticket. Por favor, intenta nuevamente');
              }
            });

          }
        }
      }
    });
  }

  assignedTicket = (ticket: Ticket): void =>{
    this.dialog.open(AssignedTicketComponent, {
      width: '25vw',
      data: {
        ticket,
        loadTicket: () => this.loadTickets()
      },
    });
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