import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { Values } from '../values';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    public ws: WebSocket;
    public wsconnected = false;

    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        private checkService: CheckService,
        private messageService: MessageService) {
    }

    public init(): void {
        this.checkService.checkVersion(false);
        this.authApiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value === false) {
                this.router.navigate(['/kahla/signin']);
            } else {
                this.authApiService.Me().subscribe(p => {
                    if (p.code === 0) {
                        this.messageService.me = p.value;
                        this.messageService.me.avatarURL = Values.fileAddress + p.value.headImgFileKey;
                        this.loadPusher();
                    }
                });
            }
        });
    }

    private loadPusher(): void {
        this.authApiService.InitPusher().subscribe(model => {
            this.ws = new WebSocket(model.serverPath);
            this.ws.onopen = () => this.wsconnected = true;
            this.ws.onmessage = this.messageService.OnMessage;
            this.ws.onerror = this.OnError;
            this.ws.onclose = this.OnError;
            if ('Notification' in window) {
                Notification.requestPermission();
            }
        });
    }

    public reconnect(): void {
        this.init();
    }

    public destory(): void {
        if (this.ws !== null && this.ws !== undefined) {
            this.ws.onclose = function () { };
            this.ws.onmessage = function () { };
            this.ws.close();
            this.ws = null;
        }
        this.wsconnected = false;
    }

    private OnError(): void {
        setTimeout(function () {
            this.reconnect();
        }, 10000);
    }
}
