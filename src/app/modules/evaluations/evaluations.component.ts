import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { EvaluationService } from 'src/app/core/services/evaluation.service';
import { Evaluation, EvaluationsResponse } from 'src/app/shared/models/evaluation';
import { ViewEvaluationComponent } from './view-evaluation/view-evaluation.component';
import { Roles } from 'src/app/shared/models/roles';

@Component({
  selector: 'app-evaluations',
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.scss']
})
export class EvaluationsComponent implements OnInit {


  id: string = this._authService.getId() || '';
  dataSourceMat =  new MatTableDataSource<Evaluation>();
  displayedColumns: string[] = [
    'year',
    'month',
    'agent',
    'evaluator',
    'rate',
    'rated',
    'actions'
  ]

  constructor(
    private _dialog: MatDialog,
    private _authService: AuthService,
    private _evaluationService: EvaluationService,
    
  ) {}

  ngOnInit(): void {
    this.loadEvaluations();
  };


  loadEvaluations = async (): Promise<void> => {
    try {
      const res: EvaluationsResponse = await firstValueFrom(
        this._authService.getRol() === Roles.ADMIN
          ? this._evaluationService.getAll({})
          : this._evaluationService.getBossId(this.id)
      );

      this.dataSourceMat.data = res.evaluations;
    }
    catch (error) {
      if ((error as HttpErrorResponse).status === 401) {
        this._authService.validateSession();
      }
    }
  };



  openViewEvaluation = (evaluation: Evaluation): void => {
    this._dialog.open(ViewEvaluationComponent, {
      width: '35vw',
      data: {
        evaluation,
        loadEvaluations: () => this.loadEvaluations(),
      }
    });
  };

}
