import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AiurEvent } from '../Models/Events/AiurEvent';
import { MessagesApiService } from './Api/MessagesApiService';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    private ws: WebSocket;
    public connecting = false;
    public errorOrClose: boolean;

    public onMessage: Subject<AiurEvent> = new Subject<AiurEvent>();
    public onErrorOrClose: Subject<boolean> = new Subject<boolean>();
    public onReconnect: Subject<void> = new Subject<void>();

    private timeoutNumber = 1000;
    private reconnectAttemptTimeout;
    private closeWebSocket = false;

    constructor(private messagesApiService: MessagesApiService) {}

    public initPusher(): void {
        this.connecting = true;
        this.closeWebSocket = false;
        this.messagesApiService.InitWebsocket().subscribe(
            model => {
                if (this.ws) {
                    this.closeWebSocket = true;
                    this.ws.close();
                }
                this.closeWebSocket = false;
                this.ws = new WebSocket(model.webSocketEndpoint);
                this.ws.onopen = () => {
                    this.connecting = false;
                    clearTimeout(this.reconnectAttemptTimeout);
                    if (this.errorOrClose) {
                        this.errorOrClose = false;
                        this.timeoutNumber = 1000;
                        this.onReconnect.next();
                    }
                };
                this.ws.onmessage = evt => {
                    this.onMessage.next(JSON.parse(evt.data) as AiurEvent);
                };
                this.ws.onerror = () => {
                    this.errorOrClosedFunc();
                    this.onErrorOrClose.next(true);
                };
                this.ws.onclose = () => {
                    this.errorOrClosedFunc();
                    this.onErrorOrClose.next(false);
                };
            },
            () => {
                this.errorOrClosedFunc();
            }
        );
    }

    private errorOrClosedFunc(): void {
        if (!this.closeWebSocket) {
            this.connecting = false;
            this.errorOrClose = true;
            this.fireNetworkAlert();
            this.autoReconnect();
        }
    }

    private autoReconnect(): void {
        this.reconnectAttemptTimeout = setTimeout(() => {
            if (this.timeoutNumber < 10000) {
                this.timeoutNumber += 1000;
            }
            this.attemptReconnect();
        }, this.timeoutNumber);
    }

    public attemptReconnect() {
        if (this.errorOrClose) {
            this.initPusher();
        }
    }

    public fireNetworkAlert(): void {
        console.warn('Websocket connection down.');
    }

    public destroyConnection() {
        this.closeWebSocket = true;
        this.ws.close();
        clearTimeout(this.reconnectAttemptTimeout);
    }
}
