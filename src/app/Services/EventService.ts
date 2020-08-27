import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AiurEvent } from '../Models/Events/AiurEvent';
import { AuthApiService } from './Api/AuthApiService';

@Injectable({
    providedIn: 'root',
})
export class EventService {
    private ws: WebSocket;
    public connecting = false;
    public online: boolean;

    public onMessage: Subject<AiurEvent> = new Subject<AiurEvent>();
    public onErrorOrClose: Subject<boolean> = new Subject<boolean>();
    public onReconnect: Subject<void> = new Subject<void>();

    private timeoutNumber = 1000;
    private reconnectAttemptTimeout: NodeJS.Timeout;
    private errorOrClose: boolean;
    private closeWebSocket = false;


    constructor(private authApiService: AuthApiService) {

    }

    public async initPusher() {
        this.connecting = true;
        this.online = navigator.onLine;
        this.closeWebSocket = false;
        try {
            const model = await this.authApiService.InitPusher();
            if (this.ws) {
                this.closeWebSocket = true;
                this.ws.close();
            }
            this.closeWebSocket = false;
            this.ws = new WebSocket(model.serverPath);
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
        } catch {
            this.errorOrClosedFunc();
        }
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
            // Warning: reconnect even connected?
            this.initPusher();
        }, this.timeoutNumber);
    }

    public fireNetworkAlert(): void {
        console.warn('Stargate connection down.');
    }

    public destroyConnection() {
        this.closeWebSocket = true;
        this.ws.close();
        clearTimeout(this.reconnectAttemptTimeout);
    }
}
