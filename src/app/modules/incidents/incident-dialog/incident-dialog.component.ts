import {Component, Inject, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-incident-dialog',
  templateUrl: './incident-dialog.component.html',
  styleUrls: ['./incident-dialog.component.scss']
})


export class IncidentDialogComponent implements OnInit {

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any
  )
  {  }

  ngOnInit(): void {
  }

}
