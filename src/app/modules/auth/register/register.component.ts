import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DialogService } from "../../../core/services/dialog.service";
import { Roles } from "../../../shared/models/roles";
import { FileService } from "../../../core/services/file.service";
import { DepartmentService } from "../../../core/services/department.service";
import SpecialPermissions from 'src/app/shared/enums/SpecialPermissions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  filteredUsers: any[] = []; // Almacenar usuarios filtrados
  users: any[] = []; // Almacenar todos los usuarios
  departments: any[] = [];

  file: any = null;

  role: string = '';

  roles: { value: Roles, label: Roles }[] = [];
  isDialog: boolean = false;

  avatarName: string | null = null;
  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dialogService: DialogService,
    private fileService: FileService,
    private departmentService: DepartmentService,
    @Optional() public dialogRef?: MatDialogRef<RegisterComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      boss: [''], // Inicializado como vacío
      reporter: [false], // Inicializa como falso
      departments: ['']
    });
  }

  ngOnInit() {
    this.isDialog = !!this.dialogRef;
    const token = localStorage.getItem('token');
    if (token) {
      this.loadRoles();
      this.loadUsers();
      this.loadDepartament();
    } else {
      this.router.navigate(['/login']);
    }

  }

  loadRoles = (): void => {
    this.role = this.authService.getRol() || '';

    if (this.role === Roles.ADMIN) {
      this.roles = Object.values(Roles).map(role => ({
        value: role,
        label: role
      }));
    }
    else {
      this.roles = [Roles.USER, Roles.AGENT, Roles.BOSS].map(role => ({
        value: role,
        label: role
      }));
    }
  };

  loadUsers() {
    this.authService.getAllUsers().subscribe(response => {
      console.log('Respuesta recibida:', response); // Verifica la estructura de la respuesta
      // @ts-ignore
      if (response && response.users && Array.isArray(response.users)) {
        // @ts-ignore
        this.users = response.users; // Asigna los usuarios a la lista si es un arreglo
        // @ts-ignore
        this.filteredUsers = this.users.filter(user => [Roles.ADMIN, Roles.BOSS, Roles.DIRECTOR].includes(user.role)); // Inicializa filteredUsers con todos los usuarios
      } else {
        console.error('Error: la respuesta no contiene un arreglo de usuarios', response);
      }
    }, error => {
      console.error('Error al cargar los usuarios', error); // Manejo de errores en la llamada
    });
  }

  loadDepartament() {
    this.departmentService.getDepartmentsWithOrganization().subscribe(response => {
      console.log('Respuesta recibida:', response);
      // @ts-ignore
      if (response && response.departments && Array.isArray(response.departments)) {
        // @ts-ignore
        this.departments = response.departments;

      } else {
        console.error('Error: la respuesta no contien un arreglo de departamento', response);
      }
    }, error => {
      console.error('Error al cargar los departamentos', error);
    })
  }


  filterUsers(event: Event) {
    const input = event.target as HTMLInputElement;
    const filterValue = input.value.toLowerCase();

    // Filtra los usuarios en función del nombre y apellido
    this.filteredUsers = this.users.filter(user =>
      (user.firstName + ' ' + user.lastName).toLowerCase().includes(filterValue)
    );
  }


  displayUserName = (id: string | null): string => {
    if (!this.filteredUsers) return '';

    const user = this.filteredUsers.find(user => user._id === id);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.file = input.files[0];
      this.form.patchValue({ avatar: this.file }); // Agrega el archivo al formulario
      this.avatarName = this.file.name; // Guarda el nombre del archivo
      console.log('Este es el valor del formulario: ', this.form.value)
    }
  }

  onRegisterSubmit() {
    if (this.form.valid) {
      const formData = this.createFormData(this.form.value);
  
      this.authService.createUser(formData).subscribe({
        next: (response) => {
          if (response) {
            const finalize = () => {
              this.dialogService.openDialog(`Éxito: ${response.message}`);
              this.form.reset();
  
              if (this.isDialog) {
                this.dialogRef?.close(true);
              } else {
                this.router.navigate(['/users']); // Redirección solo si es página
              }
            };
  
            if (this.file != null) {
              this.fileService.createAvatarFile(response.user._id, response.user._id, this.file).subscribe({
                next: (result) => {
                  if (result) {
                    const formDataAvatar = {
                      avatar: result.file._id
                    };
                    this.authService.updateUser(response.user._id, formDataAvatar).subscribe({
                      next: (res) => {
                        if (res) {
                          finalize(); // Mostrar mensaje y cerrar correctamente
                        }
                      },
                      error: (e) => {
                        console.error('Error al agregar la imagen: ', e);
                      }
                    });
                  }
                },
                error: (err) => {
                  console.error('Error al crear la imagen: ', err);
                  const errorMessage = err.error?.message || 'Ocurrió un error al crear el usuario. Intente nuevamente.';
                  this.dialogService.openDialog(`Error: ${errorMessage}`);
                }
              });
            } else {
              finalize(); // Sin imagen, pero registro exitoso
            }
          }
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          const errorMessage = error.error?.message || 'Ocurrió un error al crear el usuario. Intente nuevamente.';
          this.dialogService.openDialog(`Error: ${errorMessage}`);
        }
      });
    } else {
      let errorMessages = 'El formulario contiene errores: ';
      const errors = this.form.errors;
  
      if (errors) {
        for (const [key, value] of Object.entries(errors)) {
          errorMessages += `${key} ${value.message}. `;
        }
      }
  
      this.dialogService.openDialog(errorMessages);
    }
  }
  

  private createFormData(formValue: any): any {
    const data: any = {};

    for (const key in formValue) {
      if (formValue[key] !== '' && formValue[key] !== null) {
        data[key] = formValue[key];
      }
    }

    return data;
  }

  cancel(): void {
    if (this.isDialog) {
      this.dialogRef?.close();
    } else {
      this.router.navigate(['/users']);
    }
  }

}
