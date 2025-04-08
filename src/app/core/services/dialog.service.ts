import { Injectable } from '@angular/core';
import {DialogComponent} from "../../shared/components/dialog/dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {}

  openDialog(message: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      position: { top: '20px', right: '20px' },
      data: { message , }
    });

    return dialogRef.afterClosed();
  }

  openDialogTimer(message: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '300px',
      position: { top: '20px', right: '20px' },
      data: { message }
    });

    setTimeout(() => {
      dialogRef.close();
    }, 3000);

    return dialogRef.afterClosed();
  }
}
