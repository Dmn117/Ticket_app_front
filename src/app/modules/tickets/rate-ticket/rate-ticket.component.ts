import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { SocketWebService } from 'src/app/core/services/socket-web.service';
import { TicketService } from 'src/app/core/services/ticket.service';
import SocketEvents from 'src/app/shared/enums/Socket.events';
import { RateTicket, Ticket } from 'src/app/shared/models/ticket';

@Component({
  selector: 'app-rate-ticket',
  templateUrl: './rate-ticket.component.html',
  styleUrls: ['./rate-ticket.component.scss']
})
export class RateTicketComponent implements OnInit {

  isSubmitting: boolean = false;
  rating: number = 0;
  hoveredRating: number = 0;
  maxRate: number = 5;
  stars: number[][] = [];

  ticketForm: UntypedFormGroup = new UntypedFormGroup({
    comment: new UntypedFormControl('', Validators.required)
  });

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { ticket: Ticket, loadTicket: () => void },
    private _ticketService: TicketService,
    private _socketWebService: SocketWebService,
    private _dialogRef: MatDialogRef<RateTicketComponent>
  ) {}


  ngOnInit(): void {
    this.generateStars();
  };


  generateStars = (): void => {
    this.stars = Array.from({ length: this.maxRate }, (_, i) => {
      let index = i + 1;
      return [index - .5, index];
    });
  };


  getStarColor = (rating: number): string => {
    return rating <= this.hoveredRating || rating <= this.rating
      ? 'GOLD'
      : 'WHITE';
  };


  onHover = (rating: number): void => {
    this.hoveredRating = rating;
  };


  onLeave = (): void => {
    this.hoveredRating = 0;
  };


  selectStar = (rating: number): void => {
    this.rating = rating;
  };

  rateTicket = async (): Promise<void> => {
    try {
      this.isSubmitting = true;

      if (this.ticketForm.invalid || !this.rating) return;

      const data: Partial<RateTicket> = {
        rating: this.rating,
        comment: this.ticketForm.get('comment')?.value
      };

      const res = await firstValueFrom(
        this._ticketService.rateTicket(this.data.ticket._id, data)
      );

      this._socketWebService.emitEvent(
        SocketEvents.TicketChange,
        {
          text: `Ticket Calificado: ${data.rating}`,
          ticket: { _id: this.data.ticket._id }
        }
      );

      this.data.loadTicket();
    }
    catch (error) {
      console.log(error);
    }
    finally {
      this.closedDialog();
    }
  };

  closedDialog = (): void => {
    this._dialogRef.close();
  };
}
