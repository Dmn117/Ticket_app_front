import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment.development';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { SocketStateService } from './socket-state.service';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root',
})
export class SocketWebService {

  private socket: Socket = new Socket({
    url: environment.apiDomain,
    options: {
      query: {
        user: '',
      },
      autoConnect: false
    },
  });


  constructor(
    private _userStateService: UserStateService,
    private _socketStateService: SocketStateService,
  ) {
    this._userStateService.id$.subscribe(id => {
      this.socket = new Socket({
        url: environment.apiDomain,
        options: {
          query: {
            user: id,
          },
          autoConnect: false
        }
      })
    });
  }


  connect = (): void => {
    this.socket.connect();

    this.socket.on('connect', () => {
      this._socketStateService.setState(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this._socketStateService.setState(false);
    });

  };


  printSocket = (): void => {
    console.log('Socket connected:', this.socket);
    console.log('Connected (direct check):', this.socket.ioSocket.connected);
  };


  disconnect = (): void => {
    this.socket.disconnect();
    this._socketStateService.setState(false);

  };


  listenEvent = <T>(event: string): Observable<T> => {
    return this.socket.fromEvent(event);
  };


  emitEvent = (event: string, payload: any): void => {
    this.socket.ioSocket.emit(event, payload);
  };

}
