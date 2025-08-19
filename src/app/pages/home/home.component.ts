import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {environment} from "../../../environments/environment.development";
import {DepartmentService} from "../../core/services/department.service";
import {Department, Organization} from "../../shared/models/department";
import {SweetAlertComponent} from "../../shared/components/sweet-alert/sweet-alert.component";
import {MatDialog} from "@angular/material/dialog";
import {EditUserAvatarDialogComponent} from "./edit-user-avatar-dialog/edit-user-avatar-dialog.component";
import {Router} from "@angular/router";
import {CreateTopicDialogHomeComponent} from "./create-topic-dialog-home/create-topic-dialog-home.component";
import {HelpTopicsService} from "../../core/services/help-topic.service";
import {DialogService} from "../../core/services/dialog.service";
import {CreateTicketsComponent} from "../../modules/tickets/create-tickets/create-tickets.component";
import { OrganizationService } from 'src/app/core/services/organization.service';
import { firstValueFrom } from 'rxjs';
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userData: any;
  private apiUrl = `${environment.apiUrl}/file/get/public/file`;
  imgAvatar: string = '';
  departments: Department[] = [];
  organizations: Organization[] = [];

  // Propiedades computadas para simplificar el template
  get isAgentOrAdmin(): boolean {
    return this.userData?.user?.role === 'AGENT' || this.userData?.user?.role === 'ADMIN';
  }

  get isBossOrAdmin(): boolean {
    return this.userData?.user?.role === 'BOSS' || this.userData?.user?.role === 'ADMIN';
  }

  get isNotUserOrDirector(): boolean {
    return this.userData?.user?.role !== 'USER' && this.userData?.user?.role !== 'DIRECTOR';
  }

  get hasDepartments(): boolean {
    return this.departments.length > 0 || this.isAgentOrAdmin;
  }

  get userFullName(): string {
    return `${this.userData?.user?.firstName} ${this.userData?.user?.lastName}`;
  }

  constructor(private authService: AuthService,
              private departmentService: DepartmentService,
              private organizationService: OrganizationService,
              private cd: ChangeDetectorRef,
              private dialog: MatDialog,
              private router: Router,
              private sweetAlert: SweetAlertComponent,
              private helpTopicService: HelpTopicsService,
              private dialogService: DialogService,) {
  }

  ngOnInit(): void {
    const handleError = (error: HttpErrorResponse) => {
      if (error.status === 401) {
        this.authService.validateSession();
      } else {
        console.error('Error loading incidents:', error.message);
      }
    };


    const token = localStorage.getItem('token');
    if (token) {
    this.loadUserData();
    this.loadOrganizations();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserData(): void {
    const userId = localStorage.getItem('id');
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    this.authService.getUserById(userId).subscribe(
      (user) => {
        this.userData = user;
        this.imgAvatar = `${this.apiUrl}/${this.userData.user.avatar}`;
        this.loadDepartments();
      },
      (error) => {
        if ((error as HttpErrorResponse).status === 401) {
          this.authService.validateSession();
        } else {
          console.error('Error loading user data:', error);
        }
      }
    );
  }



  async loadOrganizations() {
    try {
      const res = await firstValueFrom(this.organizationService.getOrganizations());

      this.organizations = res.organizations;
    }
    catch (error) {
      console.log('Error al cargar las organizaciones: ', error);
    }
  };

  loadDepartments() {
    this.departmentService.getDepartments().subscribe(response => {
      console.log('Respuesta de departamentos:', response);

      // @ts-ignore
      if (Array.isArray(response.departments)) {
        // @ts-ignore
        this.departments = response.departments.filter(department =>
          this.userData.user.departments.includes(department._id)
        );
      } else {
        // @ts-ignore
        console.error('La propiedad departments no es un array:', response.departments);
      }
    }, error => {
      console.error('Error al cargar los departamentos:', error);
    });
  }


  getStars(rating: number): { filled: boolean, half: boolean }[] {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
      if (i <= Math.floor(rating)) {
        stars.push({ filled: true, half: false });
      } else if (i === Math.floor(rating) + 1 && rating % 1 >= 0.5) {
        stars.push({ filled: false, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }

    return stars;
  }



  getOrganization (id: string): Organization | null {
    return this.organizations.find(org => org._id === id) || null;
  };

  confirmChangeAvatar() {
    const dialogRef = this.dialog.open(EditUserAvatarDialogComponent, {
      data: this.userData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.newAvatarUrl) {
        this.imgAvatar = result.newAvatarUrl;
        this.cd.detectChanges();
      }
    });
  }

  openCreateTopicDialog(): void {
    if (!this.departments || this.departments.length === 0) {
      console.error('Departamentos no cargados.');
      return;
    }

    const dialogRef = this.dialog.open(CreateTopicDialogHomeComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-backdrop',
      data: { departments: this.departments }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createHelpTopicWithConfirmation(result);
      }
    });
  }


  private async createHelpTopicWithConfirmation(helpTopicData: any): Promise<void> {
    const confirmed = await this.sweetAlert.confirmAction(
      '¿Estás seguro de que deseas crear un nuevo tema de ayuda?',
      'Se procederá a crear el tema de ayuda con la información proporcionada.'
    );

    if (confirmed) {
      this.helpTopicService.createHelpTopic(helpTopicData).subscribe(() => {
        this.dialogService.openDialog('Tema de ayuda creado con éxito');
      }, error => {
        this.dialogService.openDialog('Error al crear el tema de ayuda');
      });
    }
  }


  addTicket() {
    const dialogRef = this.dialog.open(CreateTicketsComponent, {
      width: '750px',
      height: '90vh',
      maxWidth: '90vw'
    })
  }
}
