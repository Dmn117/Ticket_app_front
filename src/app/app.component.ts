import {Subscription} from "rxjs";
import {NavigationEnd, Router} from "@angular/router";
import SocketEvents from './shared/enums/Socket.events';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketWebService } from './core/services/socket-web.service';
import { SocketStateService } from "./core/services/socket-state.service";
import { UserStateService } from "./core/services/user-state.service";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthService} from "./core/services/auth.service";
import { PushNotificationService } from "ngx-push-notifications";
import { environment } from "src/environments/environment.development";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tickets_frontend';

  isLoginPage: boolean = false;
  private subscriptions: Subscription = new Subscription();
  private isSubscribed: boolean = false;

  constructor(
    private _authService: AuthService,
    private router: Router,
    private _socketWebService: SocketWebService,
    private _userStateService: UserStateService,
    private _socketStateService: SocketStateService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = ['/login', '/recover-password'].includes(this.router.url);
      }
    });
  }


  ngOnInit(): void {
    this.redirectIfNeeded();

    this._userStateService.loggedIn$.subscribe(state => {
      if (state) {
        Notification.requestPermission();
        this.connectSocket();
      }
      else {
        this.disconnectSocket();
        this.router.navigate(['/login']);
      }
    })

    this._socketStateService.state$.subscribe(state => {
      if (state && !this.isSubscribed) {
        this.listenSocket();
        this.testConnection();
      }
    });
  };

  private redirectIfNeeded(): void {
    const currentUrl = window.location.href;

    // Verifica si la URL contiene el puerto y si no está ya en tickets.connect
    if (currentUrl.includes('82.197.95.73:22227') && !currentUrl.includes('tickets.dominio.com.mx')) {
      const newUrl = currentUrl.replace('82.197.95.73:22227', 'tickets.dominio.com.mx');
      window.location.href = newUrl;  // Redirige
    }
  }


  connectSocket (): void {
    this._socketWebService.connect();
  };


  testConnection (): void {
    this._socketWebService.emitEvent(SocketEvents.Test, { text: 'Echo' })
  };

  listenSocket (): void {
    this.subscriptions.add(
      this._socketWebService.listenEvent<any>(SocketEvents.Test).subscribe((res) => {
      //  console.log('Prueba:', res);
      })
    );

    this.subscriptions.add(
      this._socketWebService.listenEvent<any>(SocketEvents.Error).subscribe((res) => {
       // console.log('Error:', res);
      })
    );

    this.subscriptions.add(
      this._socketWebService.listenEvent<any>(SocketEvents.Join).subscribe((res) => {
       console.log('Join:', res);
      })
    );

    this.subscriptions.add(
      this._socketWebService.listenEvent<any>(SocketEvents.TicketChange).subscribe((res) => {
        console.log(res);

        const fullUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

        if (res.message){
          const notification = new Notification(`Ticket #${res.ticket.number}: ${res.ticket.title}`, {
            body: `Nuevo Mensaje: ${res.message.text}`,
            icon: '../assets/Message_icon.png',
            data: `${fullUrl}/tickets/view/${res.ticket._id}`
          });

          notification.onclick = function(event) {
            event.preventDefault();
            window.open(notification.data, '_blank');
          };
        }
      })
    );

    this.isSubscribed = true;
  };


  disconnectSocket(): void {
    this.subscriptions.unsubscribe();
    this._socketWebService.disconnect();
  };


  ngOnDestroy(): void {
    this.disconnectSocket();
  }
}
