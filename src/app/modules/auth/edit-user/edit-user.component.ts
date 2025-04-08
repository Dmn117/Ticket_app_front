import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../../core/services/auth.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {firstValueFrom} from "rxjs";
import {DialogService} from "../../../core/services/dialog.service";
import {Router} from "@angular/router";
import {DepartmentService} from "../../../core/services/department.service";
import {FileService} from "../../../core/services/file.service";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import { Roles } from 'src/app/shared/models/roles';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit{

  datosRecibidos: any;

  formEditUser: FormGroup;

  bossUsers: any[] = [];
  users: any[] = [];
  avatarName: string | null = null;
  departments: any[] = [];
  file: any = null;

  // roles = Object.values(Roles);

  role: string = '';

  roles: Roles[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _authService: AuthService,
    private fb: FormBuilder,
    private _dialogService: DialogService,
    private dialogRef: MatDialogRef<EditUserComponent>,
    private router: Router,
    private _departmentService: DepartmentService,
    private _fileService: FileService,
    private sweetAlert: SweetAlertComponent
  ) {
    this.datosRecibidos = data;

    this.formEditUser = this.fb.group({
      firstName: [data.firstName],
      lastName: [data.lastName],
      email: [data.email, Validators.email],
      password: [''],
      role: [data.role],
      boss: [data.boss],
      reporter: [''],
      departments: [data.departments],
      avatar: ['']
    })
  }

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.loadRoles();
      this.loadUsers();
      this.loadDepartament();

      this._authService.getAllUsers().subscribe(response => {
        // @ts-ignore
        if (response && response.users) {
          // @ts-ignore
          this.users = response.users;
          this.bossUsers = this.users.filter(user => [Roles.ADMIN, Roles.BOSS, Roles.DIRECTOR].includes(user.role));

          // Si el jefe actual está en la lista, asignar el valor inicial
          const currentBoss = this.bossUsers.find(user => user._id === this.data.boss);
          if (currentBoss) {
            this.formEditUser.patchValue({ boss: this.data.boss });
          }
        }
      });


    } else {
      this.router.navigate(['/login']);
    }


  }


  loadRoles = (): void  => {
    this.role = this._authService.getRol() || '';

    if (this.role === Roles.ADMIN){
      this.roles = Object.values(Roles);
    }
    else {
      this.roles = [Roles.USER, Roles.AGENT, Roles.BOSS];
    }
  };


  loadUsers(){
    this._authService.getAllUsers().subscribe(response =>{
      console.log('Respuesta recibida:', response); // Verifica la estructura de la respuesta
      // @ts-ignore
      if (response && response.users && Array.isArray(response.users)) {
        // @ts-ignore
        this.users = response.users;
        // @ts-ignore
        this.bossUsers = this.users.filter(user =>  [Roles.ADMIN, Roles.BOSS, Roles.DIRECTOR].includes(user.role));
      } else {
        console.error('Error: la respuesta no contiene un arreglo de usuarios', response);
      }
    }, error => {
      console.error('Error al cargar los usuarios', error); // Manejo de errores en la llamada
    });
  }



  loadDepartament(){
    this._departmentService.getDepartmentsWithOrganization().subscribe(response => {
      console.log('Respuesta recibida:', response);
      // @ts-ignore
      if (response && response.departments && Array.isArray(response.departments)){
        // @ts-ignore
        this.departments = response.departments;

      } else{
        console.error('Error: la respuesta no contien un arreglo de departamento', response);
      }
    }, error => {
      console.error('Error al cargar los departamentos', error);
    })
  }

  displayUserName = (id: string | null): string => {
    console.log(this.bossUsers);
    if (!this.bossUsers) return '';

    const user = this.bossUsers.find(user => user._id === id);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };


  findUser = (id: string): string => {
    const user = this.users.find(user => user._id === id);

    return user ? `${user.firstName} ${user.lastName}` : 'Jefe no encontrado';
  };


  filterUsers(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.toLowerCase();

    this.bossUsers = this.users.filter(user => user.role === 'ADMIN').filter(user => (user.firstName + ' ' + user.lastName).toLowerCase().includes(filterValue));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.formEditUser.patchValue({ avatar: this.file }); // Agrega el archivo al formulario
      this.avatarName = this.file.name; // Guarda el nombre del archivo
      //console.log('Este es el valor del formulario: ', this.formEditUser.value)
    }
  }


  getRole(role: string) {
    return Roles[role as keyof typeof Roles];
  };


  updateUser = async(): Promise<void> => {
    try {
      if (this.formEditUser.value.firstName === ''){
        this.formEditUser.value.firstName = this.data.firstName;
      }

      if (this.formEditUser.value.lastName === "" || this.formEditUser.value.lastName === " " || this.formEditUser.value.lastName === null){
        if(this.data.lastName){
          this.formEditUser.value.lastName = this.data.lastName;
        }else{
          console.log('El apellido esta vacio');
        }

      }

      if (this.formEditUser.value.email === '' || this.formEditUser.value.email === this.data.email){
        delete this.formEditUser.value.email;
      }

      if (this.formEditUser.value.password === ''){
         delete this.formEditUser.value.password;
      }


      if (this.formEditUser.value.role === '') {
        delete this.formEditUser.value.role;
      }


      if (this.formEditUser.value.boss === '' || this.formEditUser.value.boss === null){
        delete this.formEditUser.value.boss;
      }

      if (this.formEditUser.value.departments === ''){
        delete this.formEditUser.value.departments;
      }

      if (this.formEditUser.value.reporter === ''){
        delete this.formEditUser.value.reporter;
      }


        const confirmed = await this.sweetAlert.confirmAction(
          '¿Estás seguro de que desas guardar los cambios?',
          'Esta acción actualizará la información del usuario'
        );

      if (confirmed){
        if (this.file != null && this.data.avatar != null){
          const avatarUpdate = await firstValueFrom(this._fileService.updateFile(this.data.avatar, this.data._id,  this.file));

          console.log(avatarUpdate);

          if (avatarUpdate){
            this.formEditUser.value.avatar = avatarUpdate.file._id;
          }
        }else if(this.file != null && this.data.avatar === null){
          const createAvatarFile = await firstValueFrom(this._fileService.createAvatarFile(this.data._id, this.data._id, this.file));

          //console.log(createAvatarFile);

          if (createAvatarFile){
            this.formEditUser.value.avatar = createAvatarFile.file._id;
          }
        }else{
          delete this.formEditUser.value.avatar;
        }

        const ediUser = this.formEditUser.value;

        //console.log(ediUser)

        const userUpdate = await firstValueFrom(this._authService.updateUser(this.data._id, ediUser));

        //console.log(userUpdate)

        if (userUpdate){
          this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => {
            this.router.navigate(['users']).then(() => {
              this.closedDialog();
              this._dialogService.openDialog(`${userUpdate.message}`);
            })
          })
        }
      } else {
        this.closedDialog();
      }

    }
    catch (error){
      console.error('Error al editar usuario: ', error)
      console.log(this.formEditUser.value)
    }
  }

  closedDialog(): void {
    this.dialogRef.close();
  }

}
