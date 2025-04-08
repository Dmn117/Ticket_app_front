import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {AuthService} from "../../../core/services/auth.service";
import {environment} from "../../../../environments/environment.development";

@Component({
  selector: 'app-rating-ticket',
  templateUrl: './rating-ticket.component.html',
  styleUrls: ['./rating-ticket.component.scss']
})
export class RatingTicketComponent implements OnInit{
  userData: any;
  private apiUrl = `${environment.apiUrl}/file/get/public/file`;
  imgAvatar: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RatingTicketComponent>,
    private _authService: AuthService
  ) {

  }

  ngOnInit() {
    console.log(this.data);
    console.log(this.data.owner);
    this.loadUser();
  }

  loadUser(): void {
    const userId = this.data.owner;

    this._authService.getUserById(userId).subscribe(response => {
      this.userData = response;
      this.imgAvatar = `${this.apiUrl}/${this.userData.user.avatar}`;
    })
  }

  getStars(rating: number): {filled: boolean, half: boolean}[] {
    const stars = [];
    const maxStars = 5;

    for (let i = 1; i <= maxStars; i++) {
      if (i <= Math.floor(rating)) {
        stars.push({filled: true, half: false});
      } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
        stars.push({filled: false, half: true});
      } else {
        stars.push({filled: false, half: false});
      }
    }
    return stars;
  }

  closedDialog(): void {
    this.dialogRef.close();
  }

}
