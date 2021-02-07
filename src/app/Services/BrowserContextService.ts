import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class BrowserContextService {

    constructor(private electronService: ElectronService) {

    }

    public isInternetExplorer(): boolean {
        return !!navigator.userAgent.match(/MSIE|Trident/);
    }

    public permittedForWebPush(): boolean {
        return Notification.permission === 'granted' && this.supportWebPush();
    }

    public supportWebPush(): boolean {
        return !this.isElectron() &&
            this.supportNotification() &&
            'serviceWorker' in navigator;
    }

    public supportNotification(): boolean {
        return 'Notification' in window;
    }

    public isElectron(): boolean {
        return this.electronService.isElectronApp;
    }

    public domainLimited(): boolean {
        return !this.isElectron();
    }

    public openWebPage(url: string): void {
        if (this.isElectron()) {
            this.electronService.shell.openExternal(url);
        } else {
            location.href = url;
        }
    }
}
