import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';
import {DepartmentService} from '../../core/services/department.service';
import {OrganizationService} from '../../core/services/organization.service';
import {SweetAlertComponent} from '../../shared/components/sweet-alert/sweet-alert.component';
import {CreateDepartmentDialogComponent} from './create-department-dialog/create-department-dialog.component';
import {EditDepartmentDialogComponent} from "./edit-department-dialog/edit-department-dialog.component";
import {Router} from "@angular/router";
import {AuthService} from "../../core/services/auth.service";
import {DialogService} from "../../core/services/dialog.service";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss']
})
export class DepartmentsComponent implements OnInit , AfterViewInit{
  @ViewChild(MatSort) sort?: MatSort;

  departments: any[] = [];
  organizations: any[] = [];
  displayedColumns: string[] = ['name', 'organization','firstName', 'actions'];
  dataSourceMat = new MatTableDataSource<any>();

  constructor(
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private sweetAlert: SweetAlertComponent,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSourceMat.sort = this.sort;
    console.log(this.sort);
  }


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchDepartments();
      this.fetchOrganizations();
    }else {
      this.router.navigate(['/login']);
    }
  }

  async fetchDepartments(): Promise<void> {
    this.departmentService.getDepartments().subscribe(response => {
      // @ts-ignore
      const departments = response.departments || [];

      this.organizationService.getOrganizations().subscribe(orgResponse => {
        // @ts-ignore
        const organizations = orgResponse.organizations || [];

        // @ts-ignore
        const departmentsWithDetails = departments.map(department => {
          // @ts-ignore
          const organization = organizations.find(org => org._id === department.organization);
          return {
            ...department,
            isEnabled: department.enabled ?? false,
            organization: organization ? { id: organization._id, name: organization.name } : { id: null, name: 'Desconocido' }, // Aquí asegúrate de que guardas el ID
            ownerId: department.owner
          };
        });

        // Obtener detalles del propietariow
        this.getOwnersDetails(departmentsWithDetails).then(departmentsWithOwners => {
          this.dataSourceMat.data = departmentsWithOwners;
        });
      });
    });
  }


  private async getOwnersDetails(departments: any[]): Promise<any[]> {
    return await Promise.all(
      departments.map(async (department) => {
        const ownerResponse = await this.authService.getUserById(department.ownerId).toPromise();
        // console.log("Owner Response:", ownerResponse);
        const owner = ownerResponse.user || {firstName: 'Desconocido', lastName: ''};
        //console.log("Owner Data:", owner);
        return {
          ...department,
          owner: {
            firstName: owner.firstName || 'Desconocido',
            lastName: owner.lastName || '',
          },
        };
      })
    );
  }

  fetchOrganizations(): void {
    this.organizationService.getOrganizationsEnabled().subscribe(response => {
      //console.log("Respuesta de organizaciones:", response);
      // @ts-ignore
      this.organizations = response.organizations.filter(org => org.enabled);
    });
  }

  async addDepartment(): Promise<void> {
    this.authService.getAllUsersEnabled().subscribe(usersResponse => {
      // @ts-ignore
      const filteredOwners = usersResponse.users.filter(user => user.role !== 'AGENT' && user.role !== 'USER');

      const dialogRef = this.dialog.open(CreateDepartmentDialogComponent, {
        width: '400px',
        data: { organizations: this.organizations, owners: filteredOwners }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.createDepartmentWithConfirmation(result);
        }
      });
    });
  }

  private async createDepartmentWithConfirmation(departmentData: any): Promise<void> {
    const confirmed = await this.sweetAlert.confirmAction(
      '¿Estás seguro de que deseas crear un nuevo departamento?',
      'Se procederá a crear el departamento con la información proporcionada.'
    );

    if (confirmed) {
      this.departmentService.createDepartment(departmentData).subscribe(() => {
        this.fetchDepartments();
        this.dialogService.openDialog('Departamento creado con éxito');
      }, error => {
        this.dialogService.openDialog('Error al crear la Departamento');
      });
    }
  }

  editDepartment(department: any): void {
    const dialogRef = this.dialog.open(EditDepartmentDialogComponent, {
      width: '400px',
      data: {
        name: department.name,
        organization: department.organization.id,
        owner: department.ownerId,
        organizations: this.organizations
      }
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        const updateData = {
          name: result.name,
          organization: result.organization,
          owner: result.owner
        };
          this.departmentService.updateDepartment(department._id, updateData).subscribe(() => {
            this.fetchDepartments();
            this.dialogService.openDialog('Departamento actualizado con éxito');
          }, error => {
            this.dialogService.openDialog('Error al actualizar el departamento');
          });
      }
    });
  }

  async activateDepartment(id: string, isEnabled: boolean): Promise<void> {
    const action = isEnabled ? 'desactivar' : 'activar';
    const confirmed = await this.sweetAlert.confirmAction(
      `¿Estás seguro que deseas ${action} este departamento?`,
      `Esta acción ${isEnabled ? 'desactivará' : 'activará'} el departamento.`
    );

    if (confirmed) {
      if (isEnabled) {
        this.departmentService.disableDepartment(id).subscribe(response => {
           const index = this.dataSourceMat.data.findIndex(department => department._id === id);
          if (index !== -1) {
            this.dataSourceMat.data[index].isEnabled = false;
          }
          console.log(`Departamento con id ${id} ha sido desactivado`);
        });
      } else {
         this.departmentService.enableDepartment(id).subscribe(response => {
           const updatedDepartment = response.department;
          const index = this.dataSourceMat.data.findIndex(department => department._id === id);
          if (index !== -1) {
            this.dataSourceMat.data[index].isEnabled = true;
          }
          console.log(`Departamento con id ${id} ha sido activado`);
        });
      }
       this.dataSourceMat._updateChangeSubscription();
    }
  }


}


