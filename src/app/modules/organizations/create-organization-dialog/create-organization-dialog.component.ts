import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-organization-dialog',
  templateUrl: './create-organization-dialog.component.html',
  styleUrls: ['./create-organization-dialog.component.scss']
})
export class CreateOrganizationDialogComponent implements OnInit {
  directors: any[] = [];
  directorID: string = '';
  organizationName: string = '';

  constructor(
    public dialogRef: MatDialogRef<CreateOrganizationDialogComponent>,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDirectors();
  }

  loadDirectors() {
    this.authService.getAllUsersEnabled().subscribe(response => {
      // @ts-ignore
      this.directors = response.users.filter(user => user.role === 'ADMIN' || user.role === 'DIRECTOR');
    });
  }

  save() {
    return {
      name: this.organizationName,
      director: this.directorID
    };
  }

  isFormComplete(): boolean {
    return this.organizationName.trim() !== '' && this.directorID !== '';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
