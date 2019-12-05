import { Injectable } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import { Themes } from '../Models/Themes';
import { KahlaUser } from '../Models/KahlaUser';

@Injectable()
export class ThemeService {

    constructor(
        private authApiService: AuthApiService,
    ) { }

    ApplyThemeFromRemote(remoteInfo: KahlaUser) {
        if (this.LocalThemeSetting !== remoteInfo.themeId) {
            this.LocalThemeSetting = remoteInfo.themeId;
        }
        this.ApplyTheme(remoteInfo.themeId);
    }

    ApplyThemeFromLocal() {
        this.ApplyTheme(this.LocalThemeSetting);
    }

    ApplyTheme(theme: Themes) {
        switch (theme) {
            case Themes.sakuraLight:
                document.body.className = 'theme-sakura-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#cf4c78');
                break;
            case Themes.sakuraDark:
                document.body.className = 'theme-sakura-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#cf4c78');
                break;
            case Themes.violetLight:
                document.body.className = 'theme-violet-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#5F4B8B');
                break;
            case Themes.violetDark:
                document.body.className = 'theme-violet-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#5F4B8B');
                break;
            case Themes.communistLight:
                document.body.className = 'theme-communist-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Themes.communistDark:
                document.body.className = 'theme-communist-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Themes.grassLight:
                document.body.className = 'theme-grass-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Themes.grassDark:
                document.body.className = 'theme-grass-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#df2710');
                break;
            case Themes.kahlaDark:
                document.body.className = 'theme-dark';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#18a4f9');
                break;
            case Themes.kahlaLight:
            default:
                document.body.className = 'theme-light';
                document.querySelector('meta[name=theme-color]')
                    .setAttribute('content', '#18a4f9');
                break;
        }
    }

    SetRemoteThemeSetting(theme: Themes): void {
        this.authApiService.UpdateClientSetting(theme, null).subscribe();
    }

    get LocalThemeSetting(): Themes {
        const themeSet = localStorage.getItem('setting-theme');
        let theme: Themes;
        if (themeSet == null) {
            theme = Themes.kahlaLight;
        } else {
            theme = parseInt(themeSet, 10) as Themes;
        }
        return theme;
    }

    set LocalThemeSetting(theme: Themes) {
        localStorage.setItem('setting-theme', theme.toString());
    }

}
