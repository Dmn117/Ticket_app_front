import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {IncidentService} from "../../core/services/incident.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableDataSource} from "@angular/material/table";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthService} from "../../core/services/auth.service";
import {IncidentDialogComponent} from "./incident-dialog/incident-dialog.component";
import { Incidence } from 'src/app/shared/models/incidence';
import { CreateIncidentComponent } from './create-incident/create-incident.component';
import { Roles } from 'src/app/shared/models/roles';
import {MatSort} from "@angular/material/sort";



@Component({
  selector: 'app-incidents',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss']
})
export class IncidentsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort?: MatSort;

  // displayedColumns: string[] = ['title', 'description', 'severity', 'author', 'agent' ,'createdAt', 'actions'];
  displayedColumns: string[] = ['title', 'description', 'agent' ,'createdAt', 'actions'];
  dataSourceMat = new MatTableDataSource<Incidence>();
  private userConected : any = localStorage.getItem('id');
  private userRol : any = localStorage.getItem('Rol')

  constructor(private incidentService: IncidentService,
              private dialog: MatDialog,
              private _authService: AuthService,) {
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSourceMat.sort = this.sort;
  }


  ngOnInit(){
  this.loadIncidents(this.userConected)
  }


  loadIncidents(userBoss: string): void {
     const handleResponse = (response: { incidents: any[] }) => {
      if (response?.incidents) {
        this.dataSourceMat.data = response.incidents;
        console.log('Incidents loaded:', response.incidents);
      } else {
        console.warn('No incidents found in the response');
        // @ts-ignore
        this.dataSourceMat.data = [];
      }
    };

    const handleError = (error: HttpErrorResponse) => {
      if (error.status === 401) {
        this._authService.validateSession();
      } else {
        console.error('Error loading incidents:', error.message);
      }
    };

     if ([Roles.DIRECTOR, Roles.BOSS].includes(this.userRol)) {
      this.incidentService.getAllBoss(userBoss).subscribe(handleResponse, handleError);
    } else {
      this.incidentService.getAll({}).subscribe(handleResponse, handleError);
    }
  }


  editIncident(incident: any) {
    console.log(incident)
  }

  viewIncident(incident: any) {
    const dialogRef = this.dialog.open(IncidentDialogComponent, {
      width: '500px',
      data: incident
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('El dialog se cerro');
    });
  }


  createIncidence () {
    const dialogRef = this.dialog.open(CreateIncidentComponent, {
      width: '30vw',
      data: {
        loadIncidents: (userBoss: string) => this.loadIncidents(userBoss),
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log('El dialog se cerro');
    });
  }

}
