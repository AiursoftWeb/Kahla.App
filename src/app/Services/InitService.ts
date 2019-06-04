import { Injectable, ElementRef } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { Values } from '../values';
import { CacheService } from './CacheService';
import { ConversationApiService } from './ConversationApiService';
import { environment } from '../../environments/environment';
import { ElectronService } from 'ngx-electron';
import { DevicesApiService } from './DevicesApiService';
import { ThemeService } from './ThemeService';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    public connecting = false;
    private ws: WebSocket;
    private timeoutNumber = 1000;
    private interval;
    private timeout;
    private online;
    private errorOrClose;
    private closeWebSocket = false;
    private options = {
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.applicationServerKey)
    };

    constructor(
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private conversationApiService: ConversationApiService,
        private _electronService: ElectronService,
        private themeService: ThemeService,
        private devicesApiService: DevicesApiService) {
    }

    public init(elementRef: ElementRef): void {
        this.online = navigator.onLine;
        this.connecting = true;
        this.closeWebSocket = false;
        this.checkService.checkVersion(false);
        if (navigator.userAgent.match(/MSIE|Trident/)) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                'Please note that Kahla doesn\'t support IE :(<br/>' +
                'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                '<a href="https://chrome.google.com">Google Chrome, </a>' +
                'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        this.authApiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value === false) {
                this.router.navigate(['/signin'], {replaceUrl: true});
            } else {
                this.authApiService.Me().subscribe(p => {
                    if (p.code === 0) {
                        this.messageService.me = p.value;
                        this.messageService.me.avatarURL = Values.fileAddress + p.value.headImgFileKey;
                        this.themeService.ApplyThemeFromRemote(elementRef, p.value);
                        if (!this._electronService.isElectronApp) {
                            this.subscribeUser();
                            this.updateSubscription();
                        }
                        this.loadPusher(false);
                        this.cacheService.updateConversation();
                        this.cacheService.updateFriends();
                        this.cacheService.updateRequests();
                    }
                });
            }
        });
    }

    private loadPusher(reconnect: boolean): void {
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
            if (this.messageService.conversation && reconnect) {
                this.messageService.getMessages(true, this.messageService.conversation.id, -1, 15);
            }
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
        localStorage.clear();
    }

    private autoReconnect(): void {
        this.timeout = setTimeout(() => {
            this.loadPusher(true);
            if (this.timeoutNumber < 10000 && this.timeoutNumber > 1000) {
                this.timeoutNumber += 1000;
            }
        }, this.timeoutNumber);
    }

    private resend(): void {
        if (navigator.onLine) {
            const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
            unsentMessages.forEach((messages, id) => {
                const sendFailMessages = [];
                for (let i = 0; i < (<Array<string>>messages).length; i++) {
                    setTimeout(() => {
                        const message = (<Array<string>>messages)[i];
                        this.conversationApiService.SendMessage(Number(id), message, this.messageService.getAtIDs(message))
                            .subscribe({
                                error(e) {
                                    if (e.status === 0 || e.status === 503) {
                                        sendFailMessages.push(message);
                                    }
                                }
                            });
                    }, 500);
                }
                unsentMessages.set(id, sendFailMessages);
                localStorage.setItem('unsentMessages', JSON.stringify(Array.from(unsentMessages)));
            });
        }
    }

    private subscribeUser(): void {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const _this = this;
            navigator.serviceWorker.ready.then(function(registration) {
                return registration.pushManager.getSubscription().then(function(sub) {
                    if (sub === null) {
                        return registration.pushManager.subscribe(_this.options)
                            .then(function(pushSubscription) {
                                return _this.devicesApiService.AddDevice(navigator.userAgent, pushSubscription.endpoint,
                                    pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth)
                                    .subscribe(function(result) {
                                        localStorage.setItem('deviceID', result.value.toString());
                                    });
                            });
                    }
                });
            }.bind(_this));
        }
    }

    private updateSubscription(): void {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const _this = this;
            navigator.serviceWorker.ready.then(function(registration) {
                return navigator.serviceWorker.addEventListener('pushsubscriptionchange', function() {
                    registration.pushManager.subscribe(_this.options)
                        .then(function(pushSubscription) {
                            return _this.devicesApiService.UpdateDevice(Number(localStorage.getItem('deviceID')), navigator.userAgent,
                                pushSubscription.endpoint, pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth)
                                .subscribe();
                        });
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
