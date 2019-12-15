import { Component, OnInit } from '@angular/core';
import { Themes } from '../Models/Themes';
import { ThemeService } from '../Services/ThemeService';

@Component({
    templateUrl: '../Views/theme.html',
    styleUrls: ['../Styles/menu.scss'],
})
export class ThemeComponent implements OnInit {
    constructor(
        private themeService: ThemeService
    ) {
    }

    public currentTheme: Themes = Themes.kahlaLight;
    public primaryColor: number;
    public accentColor: number;

    ngOnInit(): void {
        this.currentTheme = this.themeService.LocalThemeSetting;
        this.primaryColor = Math.floor(this.currentTheme / 2);
        this.accentColor = this.currentTheme % 2;
    }

    public applyTheme() {
        this.changeTheme(this.primaryColor * 2 + this.accentColor);
    }

    public changeTheme(theme: Themes) {
        if (this.currentTheme === theme) {
            return;
        }
        this.currentTheme = theme;
        this.themeService.LocalThemeSetting = theme;
        this.themeService.SetRemoteThemeSetting(theme);
        this.themeService.ApplyTheme(theme);
    }
}
