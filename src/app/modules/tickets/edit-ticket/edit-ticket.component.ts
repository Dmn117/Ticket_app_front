import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-edit-ticket',
  templateUrl: './edit-ticket.component.html',
  styleUrls: ['./edit-ticket.component.scss']
})
export class EditTicketComponent implements OnInit{
  titleTicket: string = '';
  descriptionTicket: string = '';

  originalTitle: string = '';
  originalDescription: string = '';

  constructor(
    public dialogRef: MatDialogRef<EditTicketComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _authService: AuthService
  ) {}

  ngOnInit() {
    this.titleTicket = this.data.title;
    this.descriptionTicket = this.data.description;

    this.originalTitle = this.data.title;
    this.originalDescription = this.data.description;
  }

  save() {
    this.dialogRef.close({
      id: this.data.id,
      title: this.titleTicket,
      description: this.descriptionTicket
    });
  }

  isFormChanged(): boolean {
    return this.titleTicket !== this.originalTitle || this.descriptionTicket !== this.originalDescription;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
