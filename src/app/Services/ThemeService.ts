import { Injectable, ElementRef } from '@angular/core';
import { AuthApiService } from './AuthApiService';
import { Themes } from '../Models/Themes';
import { KahlaUser } from '../Models/KahlaUser';

@Injectable()
export class ThemeService {

    constructor(
        private authApiService: AuthApiService,
    ) { }

    ApplyThemeFromRemote(elementRef: ElementRef, remoteInfo: KahlaUser) {
        if (this.LocalThemeSetting !== remoteInfo.themeId) {
            this.LocalThemeSetting = remoteInfo.themeId;
        }
        this.ApplyTheme(elementRef, remoteInfo.themeId);
    }

    ApplyThemeFromLocal(elementRef: ElementRef) {
        this.ApplyTheme(elementRef, this.LocalThemeSetting);
    }

    ApplyTheme(elementRef: ElementRef, theme: Themes) {
        switch (theme) {
            case Themes.dark:
                elementRef.nativeElement.ownerDocument.body.className = 'theme-dark';
                break;
            case Themes.light:
            default:
                elementRef.nativeElement.ownerDocument.body.className = 'theme-light';
                break;
        }
    }

    SetRemoteThemeSetting(theme: Themes): void {
        this.authApiService.UpdateClientSetting(theme).subscribe();
    }

    get LocalThemeSetting(): Themes {
        const themeSet = localStorage.getItem('setting-theme');
        let theme: Themes;
        if (themeSet == null) {
            theme = Themes.light;
        } else {
            theme = parseInt(themeSet, 10) as Themes;
        }
        return theme;
    }

    set LocalThemeSetting(theme: Themes) {
        localStorage.setItem('setting-theme', theme.toString());
    }

}
