import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../../core/services/auth.service";
import {MatTableDataSource} from "@angular/material/table";
import {firstValueFrom} from "rxjs";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {DialogService} from "../../../core/services/dialog.service";
import {EditUserComponent} from "../edit-user/edit-user.component";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import { Roles } from 'src/app/shared/models/roles';
import SpecialPermissions from 'src/app/shared/enums/SpecialPermissions';
import {MatSort} from "@angular/material/sort";
import { RegisterComponent } from '../register/register.component';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit{

  @ViewChild(MatSort) sort?: MatSort;

  dataSourceMat = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'firstName',
    'email',
    'role',
    'acciones'
  ];
  filterValue: string = '';


  role: string = this._authServise.getRol() || '';
  specialPermissions: string[] = this._authServise.getSpecialPermissions();

  editUserFlag: boolean = false;
  enableUserFlag: boolean = false;
  disableUserFlag: boolean = false;


  constructor(
    private _authServise: AuthService,
    private sweerAlert: SweetAlertComponent,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private router: Router
  ) {

  }




  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token){
      this.loadLocalStorage();
      this.loadUsers();
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSourceMat.sort = this.sort;
  }

  loadLocalStorage() {
    if (this.role === Roles.ADMIN) {
      this.editUserFlag = true;
      this.enableUserFlag = true;
      this.disableUserFlag = true;
    }
    else {
      this.editUserFlag = this.specialPermissions.includes(
        SpecialPermissions.updateUser
      );
      this.enableUserFlag = this.specialPermissions.includes(
        SpecialPermissions.enableUser
      );
      this.disableUserFlag = this.specialPermissions.includes(
        SpecialPermissions.disableUser
      );
    }
  };


  loadUsers(){
    this._authServise.getAllUsers().subscribe(response =>{
      console.log('Respuesta recibida: ', response);
      // @ts-ignore
      if(response && response.users && Array.isArray(response.users)){
        // @ts-ignore
        this.dataSourceMat.data = this.role === Roles.ADMIN
        // @ts-ignore
          ? response.users
        // @ts-ignore
          : response.users.filter(user => [Roles.USER, Roles.AGENT, Roles.BOSS].includes(user.role));
      }else{
        console.error('Error: la respuesta no contiene un arreglo de usuarios ', response);
      }
    }, error =>{
      console.log('Error al cargar los usuarios: ', error);
    })
  }

  enableUSer = async(id: string): Promise<void> => {
    try{
      const confirmed = await this.sweerAlert.confirmAction(
        '¿Estás seguro que deseas activar este usuario?',
        'Esta accion activara al usuario'
      );

      if (confirmed){
        const response = await firstValueFrom(this._authServise.activateUser(id));
        this.loadUsers();
      }
    }
    catch (error){
      console.error('Error al activar usuario: ', error);
    }
  }

  disableUser = async(id: string): Promise<void> => {
    try {
      const confirm  = await this.sweerAlert.confirmAction(
        '¿Estás seguro que deseas desactivara este usuario?',
        'Esta acción desactivara al usuario'
      );

      if (confirm){
        const response = await firstValueFrom(this._authServise.deactivateUser(id));
        this.loadUsers();
      }

    }
    catch (error) {
      console.error('Error al desactivar usuario: ', error);
    }
  }

  sendVerificationCode = async(email: string): Promise<void> =>{
    try{
      const response = await firstValueFrom(this._authServise.sendVerificationCode(email));
      if (response){
        this.sweerAlert.showSuccessAlert('Exito', response.message)
      }else{
        console.error('No se evnio el correo: ', response);
      }
    }
    catch (error){
      console.error('Error al enviar el correo: ', error);
    }
  }

  editUser(data: any): void {
    const dialogRef = this.dialog.open(EditUserComponent,{
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-backdrop',
      data: data
      })


  }

  createUser() {
    const dialogRef = this.dialog.open(RegisterComponent,{
      width: '900px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'modern-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-backdrop'
      })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ngOnInit();
      }
    });
  }


}
