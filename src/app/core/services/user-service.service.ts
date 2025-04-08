import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private userData = new BehaviorSubject<any>(null);
  private avatarUrl = new BehaviorSubject<string>('');

  constructor() { }


  setUserData(data: any) {
    this.userData.next(data);
  }

  getUserData() {
    return this.userData.asObservable();
  }

  setAvatarUrl(url: string) {
    this.avatarUrl.next(url);
  }

  getAvatarUrl() {
    return this.avatarUrl.asObservable();
  }

}
