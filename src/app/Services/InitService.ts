import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { CacheService } from './CacheService';
import { ElectronService } from 'ngx-electron';
import { DevicesApiService } from './DevicesApiService';
import { ThemeService } from './ThemeService';
import Swal from 'sweetalert2';
import { ProbeService } from './ProbeService';
import { ServerConfig } from '../Models/ServerConfig';
import { ApiService } from './ApiService';
import { ServerListApiService } from './ServerListApiService';
import { PushSubscriptionSetting } from '../Models/PushSubscriptionSetting';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    public connecting = false;
    private ws: WebSocket;
    private timeoutNumber = 1000;
    private interval;
    private timeout;
    public online: boolean;
    private errorOrClose: boolean;
    private closeWebSocket = false;
    private options = {
        userVisibleOnly: true,
        applicationServerKey: null
    };

    constructor(
        private apiService: ApiService,
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private _electronService: ElectronService,
        private themeService: ThemeService,
        private devicesApiService: DevicesApiService,
        private probeService: ProbeService,
        private serverListApiService: ServerListApiService
    ) {
    }

    public init(): void {
        if (navigator.userAgent.match(/MSIE|Trident/)) {
            Swal.fire(
                'Oops, it seems that you are opening Kahla in IE.',
                'Please note that Kahla doesn\'t support IE :(<br/>' +
                'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                '<a href="https://chrome.google.com">Google Chrome, </a>' +
                'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        this.checkService.checkVersion(false);
        // load server config
        if (localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)) {
            this.apiService.serverConfig = JSON.parse(localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)) as ServerConfig;
        } else {
            this.router.navigate(['/signin'], {replaceUrl: true});
            this.serverListApiService.Servers().subscribe(servers => {
                let target: ServerConfig;
                if (this._electronService.isElectronApp) {
                    target = servers[0];
                } else {
                    target = servers.find(t => t.domain.client === window.location.origin);
                }

                if (target) {
                    target.officialServer = true;
                    this.apiService.serverConfig = target;
                    localStorage.setItem(this.apiService.STORAGE_SERVER_CONFIG, JSON.stringify(target));
                }
                this.init();
            });
            return;
        }

        this.online = navigator.onLine;
        this.closeWebSocket = false;
        this.cacheService.initCache();

        if (this.apiService.serverConfig) {
            this.options.applicationServerKey = this.urlBase64ToUint8Array(this.apiService.serverConfig.vapidPublicKey);
            this.checkService.checkApiVersion();
            this.authApiService.SignInStatus().subscribe(signInStatus => {
                if (signInStatus.value === false) {
                    this.router.navigate(['/signin'], {replaceUrl: true});
                } else {
                    if (this.router.isActive('/signin', false)) {
                        this.router.navigate(['/home'], {replaceUrl: true});
                    }
                    this.authApiService.Me().subscribe(p => {
                        if (p.code === 0) {
                            this.cacheService.cachedData.me = p.value;
                            this.cacheService.cachedData.me.avatarURL = this.probeService.encodeProbeFileUrl(p.value.iconFilePath);
                            this.themeService.ApplyThemeFromRemote(p.value);
                            if (!this._electronService.isElectronApp && navigator.serviceWorker) {
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
        } else {
            this.router.navigate(['/signin'], {replaceUrl: true});
        }
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
            this.ws.onerror = () => {
                this.errorOrClosedFunc();
                this.fireNetworkAlert();
            };
            this.ws.onclose = () => this.errorOrClosedFunc();
            if (reconnect) {
                this.cacheService.updateConversation();
                this.cacheService.updateFriends();
                if (this.messageService.conversation) {
                    this.messageService.getMessages(0, this.messageService.conversation.id, null, 15);
                }
            }
        }, () => {
            this.fireNetworkAlert();
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

    public fireNetworkAlert(): void {
        console.error('Failed to connect to stargate channel.' + 'This might caused by the bad network you connected.<br/>' +
            'We will try to reconnect later, but before that, your message might no be the latest.', 'error');
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

    public subscribeUser() {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const _this = this;
            navigator.serviceWorker.ready.then((registration => {
                return registration.pushManager.getSubscription().then(sub => {
                    if (sub === null) {
                        return registration.pushManager.subscribe(_this.options)
                            .then(function (pushSubscription) {
                                _this.bindDevice(pushSubscription);
                            });
                    } else {
                        _this.bindDevice(sub);
                    }
                });
            }));
        }
    }

    public bindDevice(pushSubscription: PushSubscription, force: boolean = false) {
        let data: PushSubscriptionSetting = JSON.parse(localStorage.getItem('setting-pushSubscription'));
        if (!data) {
            data = {
                enabled: true,
                deviceId: 0
            };
            localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
        }
        if (!data.enabled && data.deviceId) {
            this.devicesApiService.DropDevice(data.deviceId).subscribe(_t => {
                data.deviceId = 0;
                localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
            });
        }
        if (data.enabled) {
            if (data.deviceId) {
                if (force) {
                    this.devicesApiService.UpdateDevice(data.deviceId, navigator.userAgent, pushSubscription.endpoint,
                        pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth).subscribe();
                }
            } else {
                this.devicesApiService.AddDevice(navigator.userAgent, pushSubscription.endpoint,
                    pushSubscription.toJSON().keys.p256dh, pushSubscription.toJSON().keys.auth).subscribe(t => {
                    data.deviceId = t.value;
                    localStorage.setItem('setting-pushSubscription', JSON.stringify(data));
                });
            }
        }

    }

    private updateSubscription(): void {
        if ('Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') {
            const _this = this;
            navigator.serviceWorker.ready.then(registration =>
                navigator.serviceWorker.addEventListener('pushsubscriptionchange', () => {
                    registration.pushManager.subscribe(_this.options)
                        .then(pushSubscription => {
                            _this.bindDevice(pushSubscription, true);
                        });
                }));
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
