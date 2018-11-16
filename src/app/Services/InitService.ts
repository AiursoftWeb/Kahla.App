import { Injectable } from '@angular/core';
import { CheckService } from './CheckService';
import { AuthApiService } from './AuthApiService';
import { Router } from '@angular/router';
import { MessageService } from './MessageService';
import { Values } from '../values';
import { CacheService } from './CacheService';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './ApiService';
import { AiurProtocal } from '../Models/AiurProtocal';

@Injectable({
    providedIn: 'root'
})
export class InitService {
    public ws: WebSocket;
    private timeoutNumber = 1000;
    public connecting = false;
    private interval;
    private timeout;

    constructor(
        private checkService: CheckService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private http: HttpClient) {
    }

    public init(): void {
        this.connecting = true;
        this.checkService.checkVersion(false);
        this.authApiService.SignInStatus().subscribe(signInStatus => {
            if (signInStatus.value === false) {
                this.router.navigate(['/signin']);
            } else {
                this.authApiService.Me().subscribe(p => {
                    if (p.code === 0) {
                        this.messageService.me = p.value;
                        this.messageService.me.avatarURL = Values.fileAddress + p.value.headImgFileKey;
                        this.loadPusher();
                        this.cacheService.autoUpdateConversation(null);
                    }
                });
            }
        });
    }

    private loadPusher(): void {
        this.connecting = true;
        this.authApiService.InitPusher().subscribe(model => {
            this.ws = new WebSocket(model.serverPath);
            this.ws.onopen = () => {
                this.connecting = false;
                clearTimeout(this.timeout);
                clearInterval(this.interval);
                this.interval = setInterval(this.checkNetwork.bind(this), 3000);
            };
            this.ws.onmessage = evt => this.messageService.OnMessage(evt);
            this.ws.onerror = () => this.autoReconnect();
            this.ws.onclose = () => this.autoReconnect();
            if ('Notification' in window) {
                Notification.requestPermission();
            }
        });
    }

    private checkNetwork(): void {
        if (navigator.onLine) {
            this.http.get(ApiService.serverAddress).subscribe(response => {
                if ((<AiurProtocal>response).code !== 0) {
                    this.autoReconnect();
                }
            }, error => {
                console.log(error);
                this.autoReconnect();
            });
        }
    }

    public destory(): void {
        if (this.ws !== null && this.ws !== undefined) {
            this.ws = null;
        }
    }

    private autoReconnect(): void {
        this.timeout = setTimeout(() => {
            this.loadPusher();
            if (this.timeoutNumber < 10000 && this.timeoutNumber > 1000) {
                this.timeoutNumber += 1000;
            }
        }, this.timeoutNumber);
    }
}
