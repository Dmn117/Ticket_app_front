import { DialogRef } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Message } from 'src/app/shared/models/ticket';

@Component({
  selector: 'app-view-image',
  templateUrl: './view-image.component.html',
  styleUrls: ['./view-image.component.scss']
})
export class ViewImageComponent {

  constructor (
    @Inject(MAT_DIALOG_DATA)
    public data: Message,
    private _dialogRef: DialogRef<ViewImageComponent>
  ) {}

  closedDialog = (): void => {
    this._dialogRef.close();
  };

}
