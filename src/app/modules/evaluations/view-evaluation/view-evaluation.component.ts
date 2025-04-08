import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { EvaluationService } from 'src/app/core/services/evaluation.service';
import { IncidentService } from 'src/app/core/services/incident.service';
import { SweetAlertComponent } from 'src/app/shared/components/sweet-alert/sweet-alert.component';
import { EvaluationRatingsEsR } from 'src/app/shared/enums/EvaluationRatings';
import formatLocalDate, { dateType } from 'src/app/shared/lib/FormatLocalDate';
import { Evaluation, EvaluationRating, } from 'src/app/shared/models/evaluation';
import { Incidence, IncidentQueryParams, IncidentsResponse } from 'src/app/shared/models/incidence';
import { IncidentDialogComponent } from '../../incidents/incident-dialog/incident-dialog.component';

@Component({
  selector: 'app-view-evaluation',
  templateUrl: './view-evaluation.component.html',
  styleUrls: ['./view-evaluation.component.scss']
})
export class ViewEvaluationComponent implements OnInit {

  maxRate: number = 100;
  minRate: number = 60;

  ratings: EvaluationRating[] = EvaluationRatingsEsR;
  
  rating: EvaluationRating | null = null;
  incidents: Incidence[] = [];

  dateTypeL = dateType;
  formatLocalDateL = formatLocalDate;

  evaluationForm: UntypedFormGroup = new UntypedFormGroup({
    comment: new UntypedFormControl('', Validators.required)
  });

  isSubmitting: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { evaluation: Evaluation, loadEvaluations: Function },
    private _dialog: MatDialog,
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _sweetAlert: SweetAlertComponent,
    private _incidentService: IncidentService,
    private _evaluationService: EvaluationService,
    private _dialogRef: MatDialogRef<ViewEvaluationComponent>
  ) {}


  ngOnInit(): void {
    this.loadIncidents();
  };


  loadIncidents = async (): Promise<void> => {
    try {
      const { year, month } = this.data.evaluation;
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthStr: string = month.toString().padStart(2, '0');

      const params: Partial<IncidentQueryParams> = {
        agent: this.data.evaluation.agent._id,
        startDate: `${year}-${monthStr}-01`,
        endDate: `${year}-${monthStr}-${daysInMonth}`
      };

      const res: IncidentsResponse = await firstValueFrom(
        this._incidentService.getAll(params)
      );

      this.incidents = res.incidents;
    }
    catch (error) {
      if ((error as HttpErrorResponse).status === 401) {
        this._authService.validateSession();
        this.closedDialog();
      }
    }
    finally {
      this.loadRating();
    }
  };


  loadRating = (): void => {
    this.rating = this.getRating(
      this.data.evaluation.rated
        ? Math.trunc(this.data.evaluation.rate / 10) * 10
        : Math.trunc(this.calculateRate() / 10) * 10
    );
  };


  calculateRate = (): number => {
    if (this.incidents.length === 0) return this.maxRate;

    let totalIncidents: number = this.incidents.reduce((acc, item) => {
      return acc + item.severity
    }, 0);

    totalIncidents = totalIncidents > this.maxRate
      ? this.maxRate
      : totalIncidents;

    const factor: number = ((this.maxRate - this.minRate) / this.maxRate);
    const rate: number = this.maxRate - (factor * totalIncidents);

    return rate;
  };


  getRating = (rate: number): EvaluationRating | null => {
    return this.ratings.find(rating => rating.rate === rate) || null;
  };


  selectRating = (rating: EvaluationRating): void => {
    this.rating = this.getRating(rating.rate);
  };


  itsSelected = (rating: EvaluationRating): boolean => {
    return rating.rate === this.rating?.rate;
  };


  rateEvaluation = async (): Promise<void> => {
    try {
      this.isSubmitting = true;

      if (this.evaluationForm.invalid) {
        this._dialogService.openDialog(
          `Advertencia: Favor de llenar todos los campos obligatorios antes de calificar`
        );

        return;
      }

      const isConfirmed = await this._sweetAlert.confirmAction(
        '¿Confirmar Calificación?',
        `¿Estás seguro de calificar esta evaluación como: ${this.rating?.name} (${this.rating?.rate})?`
      );

      if (!isConfirmed) return;


      const res = await firstValueFrom(
        this._evaluationService.update(this.data.evaluation._id, {
          rate: this.rating?.rate,
          comments: this.evaluationForm.get('comment')?.value,
          rated: true,
          evaluator: this._authService.getId() || '',
        })
      );

      this.data.loadEvaluations();
      this.closedDialog();
    }
    catch (error) {
      let err = error as HttpErrorResponse;

      console.log(err);

      if (err.status === 401) {
        this._authService.validateSession();
      }

      this._dialogService.openDialog(err.error.message);
    }
    finally {
      this.isSubmitting = false;
    }
  };

  viewIncident = (incident: any): void => {
    this._dialog.open(IncidentDialogComponent, {
      width: '500px',
      data: incident
    });
  };

  closedDialog = (): void => {
    this._dialogRef.close();
  };
}