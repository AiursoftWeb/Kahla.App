import { Injectable } from "@angular/core";
import { AuthApiService } from "./Api/AuthApiService";
import { Router } from "@angular/router";
import { MessageService } from "./MessageService";
import { CacheService } from "./CacheService";
import { DevicesApiService } from "./Api/DevicesApiService";
import { ThemeService } from "./ThemeService";
import Swal from "sweetalert2";
import { ApiService } from "./Api/ApiService";
import { PushSubscriptionSetting } from "../Models/PushSubscriptionSetting";
import { EventService } from "./EventService";
import { GlobalNotifyService } from "./GlobalNotifyService";
import { lastValueFrom } from "rxjs";

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
        private eventService: EventService,
        private globalNotifyService: GlobalNotifyService
    ) {}

    public async init(): Promise<void> {
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
        this.cacheService.serverConfig = await lastValueFrom(
            this.apiService.ServerInfo()
        );
        this.cacheService.initCache();

        if (this.cacheService.serverConfig) {
            this.options.applicationServerKey = this.urlBase64ToUint8Array(
                this.cacheService.serverConfig.vapidPublicKey
            );
            let signedIn = false;
            try {
                const me_resp = await lastValueFrom(this.authApiService.Me());
                this.cacheService.cachedData.me = me_resp.user;
                this.cacheService.cachedData.options = me_resp.privateSettings;
                signedIn = true;
            } catch (error) {
                console.log(error);
            }

            if (!signedIn) {
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
                    console.log("Start Webpush subscribe.")
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
                // this.cacheService.cachedData.me.avatarURL =
                //     this.probeService.encodeProbeFileUrl(this.cacheService.cachedData.me.iconFilePath);
                this.themeService.ApplyThemeFromRemote(
                    this.cacheService.cachedData.options
                );
                this.cacheService.updateConversation();
                this.cacheService.updateFriends();
            }
        } else {
            this.router.navigate(["/signin"], { replaceUrl: true });
            Swal.fire(
                "Server is not available",
                "Please try again later.",
                "error"
            );
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
                console.log("Service worker responsed");
                return registration.pushManager
                    .getSubscription()
                    .then((sub) => {
                        console.log("Got subscription:");
                        console.log(sub);

                        if (sub === null) {
                            return registration.pushManager
                                .subscribe(_this.options)
                                .then(function (pushSubscription) {
                                    console.log("Call bind device");
                                    _this.bindDevice(pushSubscription);
                                });
                        } else {
                            console.log("Call bind device");
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
        console.log(pushSubscription);
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
