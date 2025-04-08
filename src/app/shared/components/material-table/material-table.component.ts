import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import { filter } from 'rxjs';

@Component({
  selector: 'app-material-table',
  templateUrl: './material-table.component.html',
  styleUrls: ['./material-table.component.scss']
})
export class MaterialTableComponent implements OnInit, AfterViewInit{
  @Input() displayedColumns: string[] = [];
  @Input() dataSourceMat = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Variable para el filtro
  filterValue: string = '';
  
  statusFilterValue: string = '';

  ngOnInit() {
    
  }

  ngAfterViewInit() {
      this.dataSourceMat.paginator = this.paginator;
      this.dataSourceMat.sort = this.sort;

  }
  
  applyFilter() {
    this.dataSourceMat.filter = this.filterValue.trim().toLowerCase();
  }

}
