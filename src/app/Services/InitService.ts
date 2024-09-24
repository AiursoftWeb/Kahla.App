import { Injectable } from "@angular/core";
import { AuthApiService } from "./Api/AuthApiService";
import { Router } from "@angular/router";
import { MessageService } from "./MessageService";
import { CacheService } from "./CacheService";
import { DevicesApiService } from "./Api/DevicesApiService";
import { ThemeService } from "./ThemeService";
import Swal from "sweetalert2";
import { ProbeService } from "./ProbeService";
import { ServerConfig } from "../Models/ServerConfig";
import { ApiService } from "./Api/ApiService";
import { ServerListApiService } from "./Api/ServerListApiService";
import { PushSubscriptionSetting } from "../Models/PushSubscriptionSetting";
import { EventService } from "./EventService";
import { GlobalNotifyService } from "./GlobalNotifyService";

@Injectable({
    providedIn: "root",
})
export class InitService {
    private options = {
        userVisibleOnly: true,
        applicationServerKey: null,
    };

    constructor(
        private apiService: ApiService,
        private authApiService: AuthApiService,
        private router: Router,
        private messageService: MessageService,
        private cacheService: CacheService,
        private themeService: ThemeService,
        private devicesApiService: DevicesApiService,
        private probeService: ProbeService,
        private serverListApiService: ServerListApiService,
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService
    ) {}

    public init(): void {
        if (navigator.userAgent.match(/MSIE|Trident/)) {
            Swal.fire(
                "Oops, it seems that you are opening Kahla in IE.",
                "Please note that Kahla doesn't support IE :(<br/>" +
                    'We recommend upgrading to the latest <a href="https://mozilla.org/firefox/">Firefox</a>, ' +
                    '<a href="https://chrome.google.com">Google Chrome, </a>' +
                    'or <a href="https://www.microsoft.com/en-us/windows/microsoft-edge">Microsoft Edge</a>.'
            );
        }
        // load server config
        let reload = false;
        if (localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)) {
            this.apiService.serverConfig = JSON.parse(
                localStorage.getItem(this.apiService.STORAGE_SERVER_CONFIG)
            ) as ServerConfig;
            if (
                this.apiService.serverConfig._cacheVersion !==
                ServerConfig.CACHE_VERSION
            ) {
                reload = true;
                this.apiService.serverConfig = null;
            }
        } else {
            reload = true;
        }
        if (reload) {
            this.router.navigate(["/signin"], { replaceUrl: true });
            this.serverListApiService.Servers().subscribe((servers) => {
                let target: ServerConfig;
                target =
                    servers.find(
                        (t) => t.domain.client === window.location.origin
                    ) ?? servers[0];

                if (target) {
                    target.officialServer = true;
                    target._cacheVersion = ServerConfig.CACHE_VERSION;
                    this.apiService.serverConfig = target;
                    localStorage.setItem(
                        this.apiService.STORAGE_SERVER_CONFIG,
                        JSON.stringify(target)
                    );
                }
                this.init();
            });
            return;
        }

        this.cacheService.initCache();

        if (this.apiService.serverConfig) {
            this.options.applicationServerKey = this.urlBase64ToUint8Array(
                this.apiService.serverConfig.vapidPublicKey
            );
            this.authApiService.SignInStatus().subscribe((signInStatus) => {
                if (signInStatus.value === false) {
                    this.router.navigate(["/signin"], { replaceUrl: true });
                } else {
                    if (this.router.isActive("/signin", false)) {
                        this.router.navigate(["/home"], { replaceUrl: true });
                    }

                    // Webpush Service
                    if (
                        // !this._electronService.isElectronApp && // TODO: ELECTRON
                        navigator.serviceWorker
                    ) {
                        this.subscribeUser();
                        this.updateSubscription();
                    }

                    // Init stargate push
                    this.eventService.initPusher();
                    this.eventService.onMessage.subscribe((t) =>
                        this.messageService.OnMessage(t)
                    );
                    this.eventService.onReconnect.subscribe(() =>
                        this.messageService.reconnectPull()
                    );
                    this.globalNotifyService.init();

                    // Load User Info
                    this.authApiService.Me().subscribe((p) => {
                        if (p.code === 0) {
                            this.cacheService.cachedData.me = p.value;
                            this.cacheService.cachedData.me.avatarURL =
                                this.probeService.encodeProbeFileUrl(
                                    p.value.iconFilePath
                                );
                            this.themeService.ApplyThemeFromRemote(p.value);
                            this.cacheService.updateConversation();
                            this.cacheService.updateFriends();
                            this.cacheService.updateRequests();
                        }
                    });
                }
            });
        } else {
            this.router.navigate(["/signin"], { replaceUrl: true });
        }
    }

    public destroy(): void {
        this.eventService.destroyConnection();
        this.messageService.resetVariables();
        this.cacheService.reset();
        localStorage.clear();
    }

    public subscribeUser() {
        if (
            "Notification" in window &&
            "serviceWorker" in navigator &&
            Notification.permission === "granted"
        ) {
            const _this = this;
            navigator.serviceWorker.ready.then((registration) => {
                return registration.pushManager
                    .getSubscription()
                    .then((sub) => {
                        if (sub === null) {
                            return registration.pushManager
                                .subscribe(_this.options)
                                .then(function (pushSubscription) {
                                    _this.bindDevice(pushSubscription);
                                });
                        } else {
                            _this.bindDevice(sub);
                        }
                    });
            });
        }
    }

    public bindDevice(
        pushSubscription: PushSubscription,
        force: boolean = false
    ) {
        let data: PushSubscriptionSetting = JSON.parse(
            localStorage.getItem("setting-pushSubscription")
        );
        if (!data) {
            data = {
                enabled: true,
                deviceId: 0,
            };
            localStorage.setItem(
                "setting-pushSubscription",
                JSON.stringify(data)
            );
        }
        if (!data.enabled && data.deviceId) {
            this.devicesApiService.DropDevice(data.deviceId).subscribe((_t) => {
                data.deviceId = 0;
                localStorage.setItem(
                    "setting-pushSubscription",
                    JSON.stringify(data)
                );
            });
        }
        if (data.enabled) {
            if (data.deviceId) {
                if (force) {
                    this.devicesApiService
                        .UpdateDevice(
                            data.deviceId,
                            navigator.userAgent,
                            pushSubscription.endpoint,
                            pushSubscription.toJSON().keys.p256dh,
                            pushSubscription.toJSON().keys.auth
                        )
                        .subscribe();
                }
            } else {
                this.devicesApiService
                    .AddDevice(
                        navigator.userAgent,
                        pushSubscription.endpoint,
                        pushSubscription.toJSON().keys.p256dh,
                        pushSubscription.toJSON().keys.auth
                    )
                    .subscribe((t) => {
                        data.deviceId = t.value;
                        localStorage.setItem(
                            "setting-pushSubscription",
                            JSON.stringify(data)
                        );
                    });
            }
        }
    }

    private updateSubscription(): void {
        if (
            "Notification" in window &&
            "serviceWorker" in navigator &&
            Notification.permission === "granted"
        ) {
            const _this = this;
            navigator.serviceWorker.ready.then((registration) =>
                navigator.serviceWorker.addEventListener(
                    "pushsubscriptionchange",
                    () => {
                        registration.pushManager
                            .subscribe(_this.options)
                            .then((pushSubscription) => {
                                _this.bindDevice(pushSubscription, true);
                            });
                    }
                )
            );
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}
