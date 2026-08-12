import { Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel
} from '@microsoft/signalr';

import { Subject } from 'rxjs';

export interface EnrollmentStatusEvent {
  id: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LiveSyncService {

  private connection!: HubConnection;

  private eventsSubject =
    new Subject<EnrollmentStatusEvent>();

  events$ = this.eventsSubject.asObservable();

  connect(): void {

    // Don't create another connection if already connected
    if (
      this.connection &&
      this.connection.state === 'Connected'
    ) {
      return;
    }

    this.connection =
      new HubConnectionBuilder()

        // IMPORTANT:
        // Change this URL if your API uses HTTPS
        .withUrl('http://localhost:5178/hubs/tms')

        .withAutomaticReconnect([
          0,
          2000,
          10000,
          30000
        ])

        .configureLogging(LogLevel.Information)

        .build();


    // Receive event from .NET
    this.connection.on(
      'ReceiveEnrollmentStatusUpdated',
      (id: string, status: string) => {

        console.log(
          'SignalR enrollment update:',
          id,
          status
        );

        this.eventsSubject.next({
          id: String(id),
          status
        });

      }
    );


    this.connection.onreconnecting(error => {

      console.warn(
        'SignalR reconnecting...',
        error?.message
      );

    });


    this.connection.onreconnected(connectionId => {

      console.log(
        'SignalR reconnected:',
        connectionId
      );

    });


    this.connection.onclose(error => {

      console.warn(
        'SignalR connection closed',
        error
      );

    });


    this.connection
      .start()
      .then(() => {

        console.log(
          '✅ SignalR connected to TMS Hub'
        );

      })
      .catch(error => {

        console.error(
          '❌ SignalR connection failed:',
          error
        );

      });
  }
}