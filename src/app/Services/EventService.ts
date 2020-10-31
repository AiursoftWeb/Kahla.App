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
    public errorOrClose: boolean;

    public onMessage: Subject<AiurEvent> = new Subject<AiurEvent>();
    public onErrorOrClose: Subject<boolean> = new Subject<boolean>();
    public onReconnect: Subject<void> = new Subject<void>();

    private timeoutNumber = 1000;
    private reconnectAttemptTimeout: NodeJS.Timeout;
    private closeWebSocket = false;


    constructor(private authApiService: AuthApiService) {
    }

    public async initPusher(): Promise<void> {
        this.connecting = true;
        this.closeWebSocket = false;
        try {
            const pusherModel = await this.authApiService.InitPusher();
            if (this.ws) {
                this.closeWebSocket = true;
                this.ws.close();
            }
            this.closeWebSocket = false;
            this.ws = new WebSocket(pusherModel.serverPath);
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
            this.attemptReconnect();
        }, this.timeoutNumber);
    }

    public async attemptReconnect(): Promise<void> {
        if (this.errorOrClose) {
            await this.initPusher();
        }
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
