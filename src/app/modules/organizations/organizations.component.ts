import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {OrganizationService} from "../../core/services/organization.service";
import {MatTableDataSource} from "@angular/material/table";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {SweetAlertComponent} from "../../shared/components/sweet-alert/sweet-alert.component";
import {EditOrganizationDialogComponent} from "./edit-organization-dialog/edit-organization-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {DialogService} from "../../core/services/dialog.service";
import {CreateOrganizationDialogComponent} from "./create-organization-dialog/create-organization-dialog.component";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.scss']
})
export class OrganizationsComponent implements OnInit , AfterViewInit{
  @ViewChild(MatSort) sort?: MatSort;

  organizations: any[] = [];

  displayedColumns: string[] = ['name', 'director', 'actions'];
  dataSourceMat = new MatTableDataSource<any>();

  constructor(private organizationService: OrganizationService,
              private router: Router,
              private authService: AuthService,
              private sweetAlert: SweetAlertComponent,
              private dialog: MatDialog,
              private dialogService: DialogService
  ) {
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSourceMat.sort = this.sort;
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchOrganizations();
    } else {
      this.router.navigate(['/login']);
    }
  }

  async fetchOrganizations(): Promise<void> {
    this.organizationService.getOrganizations().subscribe(async response => {
      // @ts-ignore
      const organizations = Array.isArray(response.organizations) ? response.organizations : [];

      for (let org of organizations) {
        if (org.director && org.director._id) {
          try {
            const directorResponse = await this.authService.getUserById(org.director._id).toPromise();
            const director = directorResponse.user;
            // console.log('Datos del director:', director);
            org.directorInfo = director ? `${director.firstName} ${director.lastName}` : 'No asignado';
            org.directorRole = director ? director.role : '';
          } catch (error) {
            // console.error('Error al obtener el director:', error);
            org.directorInfo = 'No asignado';
            org.directorRole = 'Error al obtener rol';
          }
        } else {
          org.directorInfo = 'No asignado';
          org.directorRole = 'Sin rol';
        }
      }

      this.dataSourceMat.data = organizations;
      // console.log('Datos de la tabla:', this.dataSourceMat.data);
    });
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object' && !Array.isArray(value);
  }

  async activateOrganization(id: string, isEnabled: boolean): Promise<void> {
    const action = isEnabled ? 'desactivar' : 'activar';
    // console.log('Se llama a la función de confirmación');
    const confirmed = await this.sweetAlert.confirmAction(
      `¿Estás seguro que deseas ${action} esta organización?`,
      `Esta acción ${isEnabled ? 'desactivará' : 'activará'} la organización.`
    );

    if (confirmed) {
      if (isEnabled) {
        this.organizationService.disableOrganization(id).subscribe(() => this.fetchOrganizations());
      } else {
        this.organizationService.enableOrganization(id).subscribe(() => this.fetchOrganizations());
      }
    }
  }

  editOrganization(data: any): void {
    const dialogRef = this.dialog.open(EditOrganizationDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      data: {
        id: data._id,
        name: data.name,
        directorID: data.director ? data.director._id : null
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const updatedOrganization: any = {};

        if (result.name !== data.name) {
          updatedOrganization.name = result.name;
        }

        if (result.director && result.director.id !== data.director?._id) {
          updatedOrganization.director = result.director.id;
        }

        if (Object.keys(updatedOrganization).length > 0) {
          const confirmed = await this.sweetAlert.confirmAction(
            '¿Estás seguro de que deseas guardar los cambios?',
            'Esta acción actualizará la información de la organización.'
          );

          if (confirmed) {
            this.organizationService.updateOrganization(result.id, updatedOrganization).subscribe({
              next: () => {
                this.fetchOrganizations();
                this.dialogService.openDialogTimer('Organización actualizada con éxito.');
              },
              error: () => {
                this.dialogService.openDialogTimer('Error al actualizar la organización. Por favor, intenta nuevamente.');
              }
            });
          }
        }
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateOrganizationDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const confirmed = await this.sweetAlert.confirmAction(
          '¿Estás seguro de crear esta nueva organización?',
          'Esta acción creará una nueva organización.'
        );

        if (confirmed) {
          this.organizationService.createOrganization(result).subscribe(() => {
            this.fetchOrganizations();
            this.dialogService.openDialog('Organización creada con éxito');
          }, error => {
            this.dialogService.openDialog('Error al crear la organización');
          });
        }
      }
    });
  }


}
