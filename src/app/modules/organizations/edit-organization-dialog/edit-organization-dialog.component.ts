import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-edit-organization-dialog',
  templateUrl: './edit-organization-dialog.component.html',
  styleUrls: ['./edit-organization-dialog.component.scss']
})
export class EditOrganizationDialogComponent implements OnInit {
  directors: any[] = [];
  directorID: string = '';
  organizationName: string = '';
  originalDirectorID: string = '';
  originalOrganizationName: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditOrganizationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDirectors();
    this.directorID = this.data.directorID;
    this.organizationName = this.data.name;

    this.originalDirectorID = this.data.directorID;
    this.originalOrganizationName = this.data.name;
  }


  loadDirectors() {
    this.authService.getAllUsersEnabled().subscribe(response => {
      // @ts-ignore
      if (response && response.users && Array.isArray(response.users)) {
        // @ts-ignore
        this.directors = response.users.filter(user => user.role === 'ADMIN' || user.role === 'DIRECTOR');
      } else {
        console.error('Error: Expected response.users to be an array', response);
      }
    }, error => {
      console.error('Error fetching users:', error);
    });
  }

  save() {
    this.dialogRef.close({
      id: this.data.id,
      name: this.organizationName,
      director: { id: this.directorID }
    });
  }

  isFormChanged(): boolean {
    return this.organizationName !== this.originalOrganizationName || this.directorID !== this.originalDirectorID;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
