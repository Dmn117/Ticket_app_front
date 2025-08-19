import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { SweetAlertComponent } from '../../shared/components/sweet-alert/sweet-alert.component';
import { Router } from '@angular/router';
import { HelpTopicsService } from "../../core/services/help-topic.service";
import { DialogService } from "../../core/services/dialog.service";
import {
  EditOrganizationDialogComponent
} from "../organizations/edit-organization-dialog/edit-organization-dialog.component";
import {DepartmentService} from "../../core/services/department.service";
import {CreateTopicDialogComponent} from "./create-topic-dialog/create-topic-dialog.component";
import {EditTopicDialogComponent} from "./edit-topic-dialog/edit-topic-dialog.component";
import {MatSort} from "@angular/material/sort";
import MinutesToString from 'src/app/shared/lib/MinutesToString';

@Component({
  selector: 'app-help-topics',
  templateUrl: './help-topics.component.html',
  styleUrls: ['./help-topics.component.scss'] ,
})
export class HelpTopicsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort?: MatSort;

  helpTopics: any[] = [];
  displayedColumns: string[] = ['name', 'tags', 'department', 'expIn' , 'actions'];
  dataSourceMat = new MatTableDataSource<any>(this.helpTopics);

  minutes2String = MinutesToString;

  constructor(
    private helpTopicService: HelpTopicsService,
    private sweetAlert: SweetAlertComponent,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private departmentService: DepartmentService
  ) {}

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSourceMat.sort = this.sort
  }


  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.fetchHelpTopics();
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchHelpTopics(): void {
    this.helpTopicService.getHelpTopics().subscribe(response => {
      const helpTopics = response.helpTopics || [];

      this.departmentService.getDepartments().subscribe(departmentsResponse => {
        // @ts-ignore
        const departments = departmentsResponse.departments || [];

        // @ts-ignore
        const helpTopicsWithDepartments = helpTopics.map(topic => {
          // @ts-ignore
          const department = departments.find(dep => dep._id === topic.department);

         //console.log(`Tema de ayuda: ${topic._id}, Estado: ${topic.enabled}`);

          return {
            ...topic,
            departmentName: department ? department.name : 'Desconocido'
          };
        });

        this.helpTopics = helpTopicsWithDepartments;
        this.dataSourceMat.data = this.helpTopics;

        //console.log("dataSourceMat:", this.dataSourceMat.data);
      });
    });
  }


  addHelpTopic(): void {
    const dialogRef = this.dialog.open(CreateTopicDialogComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel'
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
        this.fetchHelpTopics();
        this.dialogService.openDialog('Tema de ayuda creado con éxito');
      }, error => {
        this.dialogService.openDialog('Error al crear el tema de ayuda');
      });
    }
  }

  async activateHelpTopic(id: string, isEnabled: boolean): Promise<void> {
    const action = isEnabled ? 'desactivar' : 'activar';
    const confirmed = await this.sweetAlert.confirmAction(
      `¿Estás seguro que deseas ${action} este tema de ayuda?`,
      `Esta acción ${isEnabled ? 'desactivará' : 'activará'} el tema de ayuda.`
    );

    if (confirmed) {
      const request$ = isEnabled
        ? this.helpTopicService.disableHelpTopic(id)
        : this.helpTopicService.enableHelpTopic(id);

      request$.subscribe(() => {
        const index = this.dataSourceMat.data.findIndex(topic => topic._id === id);
        if (index !== -1) {
          this.dataSourceMat.data[index].enabled = !isEnabled;
        }
        this.dataSourceMat._updateChangeSubscription();
      });
    }
  }

  editHelpTopic(helpTopic: any): void {
    const dialogRef = this.dialog.open(EditTopicDialogComponent, {
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      data: { name: helpTopic.name, tags: helpTopic.tags, department: helpTopic.department, expIn: helpTopic.expIn, },
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
         const confirmed = await this.sweetAlert.confirmAction(
          '¿Estás seguro de que deseas actualizar este tema de ayuda?',
          'Esta acción actualizará la información del tema de ayuda.'
        );

        if (confirmed) {
          const updateData = {
            name: result.name,
            tags: result.tags,
            department: result.department,
            expIn: result.expIn
          };

          console.log(updateData);

          this.helpTopicService.updateHelpTopic(helpTopic._id, updateData).subscribe(
            () => {
              this.fetchHelpTopics();
              this.dialogService.openDialog('Tema de ayuda actualizado con éxito');
            },
            error => {
              this.dialogService.openDialog('Error al actualizar el tema de ayuda');
            }
          );
        }
      }
    });
  }
}
