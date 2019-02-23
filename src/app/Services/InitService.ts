import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { Values } from '../values';
import { CacheService } from './CacheService';
import { ConversationApiService } from './ConversationApiService';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    private ws: WebSocket;
    private timeoutNumber = 1000;
    public connecting = false;
    private interval;
    private timeout;
    private online;
    private errorOrClose;
    private closeWebSocket = false;

    constructor(
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private conversationApiService: ConversationApiService) {
    }

    public init(): void {
        this.online = navigator.onLine;
        this.connecting = true;
        this.closeWebSocket = false;
        this.checkService.checkVersion(false);
        this.authApiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value === false) {
                this.router.navigate(['/signin'], {replaceUrl: true});
            } else {
                this.authApiService.Me().subscribe(p => {
                    if (p.code === 0) {
                        this.messageService.me = p.value;
                        this.messageService.me.avatarURL = Values.fileAddress + p.value.headImgFileKey;
                        this.subscribeUser();
                        this.loadPusher();
                        this.cacheService.autoUpdateConversation();
                        this.cacheService.autoUpdateRequests();
                    }
                });
            }
        });
    }

    private loadPusher(): void {
        this.connecting = true;
        this.authApiService.InitPusher().subscribe(model => {
            if (this.ws) {
                this.closeWebSocket = true;
                this.ws.close();
            }
            this.errorOrClose = false;
            this.closeWebSocket = false;
            this.ws = new WebSocket(model.serverPath);
            this.ws.onopen = () => {
                this.connecting = false;
                clearTimeout(this.timeout);
                clearInterval(this.interval);
                this.interval = setInterval(this.checkNetwork.bind(this), 3000);
            };
            this.ws.onmessage = evt => this.messageService.OnMessage(evt);
            this.ws.onerror = () => this.errorOrClosedFunc();
            this.ws.onclose = () => this.errorOrClosedFunc();
            this.resend();
        }, () => {
                this.errorOrClosedFunc();
        });
    }

    private errorOrClosedFunc(): void {
        if (!this.closeWebSocket) {
            this.connecting = false;
            this.errorOrClose = true;
            clearTimeout(this.timeout);
            clearInterval(this.interval);
            this.interval = setInterval(this.checkNetwork.bind(this), 3000);
        }
    }

    private checkNetwork(): void {
    if (navigator.onLine && !this.connecting && (!this.online || this.errorOrClose)) {
            this.autoReconnect();
        }
        this.online = navigator.onLine;
    }

    public destroy(): void {
        this.closeWebSocket = true;
        if (this.ws) {
            this.ws.close();
        }
        clearTimeout(this.timeout);
        clearInterval(this.interval);
        this.timeout = null;
        this.interval = null;
        this.messageService.resetVariables();
        this.cacheService.reset();
        this.messageService.me = null;
    }

    private autoReconnect(): void {
        this.timeout = setTimeout(() => {
            this.loadPusher();
            if (this.timeoutNumber < 10000 && this.timeoutNumber > 1000) {
                this.timeoutNumber += 1000;
            }
        }, this.timeoutNumber);
    }

    private resend(): void {
        const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
        unsentMessages.forEach((messages, id) => {
            const sendFailMessages = [];
            for (let i = 0; i < (<Array<string>>messages).length; i++) {
                setTimeout(() => {
                    this.conversationApiService.SendMessage(Number(id), (<Array<string>>messages)[i]).subscribe(() => {}, () => {
                        sendFailMessages.push((<Array<string>>messages)[i]);
                    });
                }, 500);
            }
            unsentMessages.set(id, sendFailMessages);
            localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
        });
    }

    private subscribeUser(): void {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const _this = this;
            navigator.serviceWorker.ready.then(function(registration) {
                registration.pushManager.getSubscription().then(function(sub) {
                    if (sub === null) {
                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: _this.urlBase64ToUint8Array(environment.applicationServerKey)
                        }).then(function(pushSubscription) {
                            _this.authApiService.AddDevice(pushSubscription.endpoint,
                                pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth)
                                .subscribe();
                        });
                    }
                });
            }.bind(_this));
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
