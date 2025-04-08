import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";

@Component({
  selector: 'app-edit-department-dialog',
  templateUrl: './edit-department-dialog.component.html',
  styleUrls: ['./edit-department-dialog.component.scss']
})
export class EditDepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;
  filteredOwners: any[] = [];
  originalValues: any;

  constructor(
    public dialogRef: MatDialogRef<EditDepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private authService: AuthService,
    private sweetAlert: SweetAlertComponent,
  ) {
    this.departmentForm = this.fb.group({
      name: [data.name, Validators.required],
      organization: [data.organization, Validators.required],
      owner: [data.owner, Validators.required]
    });

    this.originalValues = {
      name: data.name,
      organization: data.organization,
      owner: data.owner
    };
  }

  ngOnInit(): void {
    console.log('Datos del diálogo:', this.data);
    this.createForm();
    this.fetchUsers();
  }

  createForm(): void {
    this.departmentForm = this.fb.group({
      id: [this.data._id],
      name: [this.data.name, Validators.required],
      organization: [this.data.organization, Validators.required],
      owner: [this.data.owner, Validators.required]
    });
  }


  fetchUsers(): void {
    this.authService.getAllUsersEnabled().subscribe(usersResponse => {
      // @ts-ignore
      this.filteredOwners = usersResponse.users.filter(user => user.role !== 'AGENT' && user.role !== 'USER');
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      this.sweetAlert.confirmAction(
        '¿Estás seguro de que deseas guardar los cambios?',
        'Esta acción actualizará la información del departamento.'
      ).then(confirmed => {
        if (confirmed) {
          this.dialogRef.close(this.departmentForm.value);
        }
      });
    }
  }

  isFormChanged(): boolean {
    return this.departmentForm.get('name')?.value !== this.originalValues.name ||
      this.departmentForm.get('organization')?.value !== this.originalValues.organization ||
      this.departmentForm.get('owner')?.value !== this.originalValues.owner;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
