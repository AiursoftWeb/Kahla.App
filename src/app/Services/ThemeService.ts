import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import { Theme } from '../Models/Theme';
import { KahlaUser } from '../Models/KahlaUser';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {

    constructor(
        private authApiService: AuthApiService,
    ) {
    }

    public mediaListener: MediaQueryList;
    private _notifyIcon = false;

    ApplyThemeFromRemote(remoteInfo: KahlaUser) {
        if (this.LocalThemeSetting !== remoteInfo.themeId) {
            this.LocalThemeSetting = remoteInfo.themeId;
        }
        this.ApplyTheme(remoteInfo.themeId);
    }

    ApplyThemeFromLocal() {
        this.ApplyTheme(this.LocalThemeSetting);
    }

    ApplyTheme(theme: Theme) {
        let themeComputed = theme;
        if (theme % 3 === 0) {
            if (!this.mediaListener) {
                this.mediaListener = matchMedia('(prefers-color-scheme: dark)');
                this.mediaListener.onchange = () => this.ApplyThemeFromLocal();
            }
            if (this.mediaListener.matches) {
                themeComputed = theme + 2;
            } else {
                themeComputed = theme + 1;
            }
        } else {
            // make sure all media listener detached
            if (this.mediaListener) {
                this.mediaListener.onchange = null;
                this.mediaListener = null;
            }
        }
        switch (themeComputed) {
            case Theme.sakuraLight:
                document.body.className = 'theme-sakura-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#cf4c78');
                break;
            case Theme.sakuraDark:
                document.body.className = 'theme-sakura-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#cf4c78');
                break;
            case Theme.violetLight:
                document.body.className = 'theme-violet-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#5F4B8B');
                break;
            case Theme.violetDark:
                document.body.className = 'theme-violet-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#5F4B8B');
                break;
            case Theme.communistLight:
                document.body.className = 'theme-communist-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Theme.communistDark:
                document.body.className = 'theme-communist-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Theme.grassLight:
                document.body.className = 'theme-grass-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#409344');
                break;
            case Theme.grassDark:
                document.body.className = 'theme-grass-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#409344');
                break;
            case Theme.kahlaDark:
                document.body.className = 'theme-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#18a4f9');
                break;
            case Theme.kahlaLight:
            default:
                document.body.className = 'theme-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#18a4f9');
                break;
        }
    }

    IsDarkTheme(): boolean {
        const theme = this.LocalThemeSetting;
        if (theme % 3 === 0) {
            if (!this.mediaListener) {
                this.mediaListener = matchMedia('(prefers-color-scheme: dark)');
                this.mediaListener.onchange = () => this.ApplyThemeFromLocal();
            }
            return this.mediaListener.matches;
        } else {
            return (theme - 2) % 3 === 0;
        }
    }

    SetRemoteThemeSetting(theme: Theme): void {
        this.authApiService.UpdateClientSetting(theme, null).subscribe();
    }

    get LocalThemeSetting(): Theme {
        const themeSet = localStorage.getItem('setting-theme');
        let theme: Theme;
        if (themeSet == null) {
            theme = Theme.kahlaAuto;
        } else {
            theme = parseInt(themeSet, 10) as Theme;
        }
        return theme;
    }

    set LocalThemeSetting(theme: Theme) {
        localStorage.setItem('setting-theme', theme.toString());
    }

    public set NotifyIcon(value: boolean) {
        if (value === this._notifyIcon) {
            return;
        }
        if (value) {
            document.querySelector('link[rel=icon]')
                .setAttribute('href', 'favicon_notify.ico');
        } else {
            document.querySelector('link[rel=icon]')
                .setAttribute('href', 'favicon.ico');
        }
        this._notifyIcon = value;
    }

}
