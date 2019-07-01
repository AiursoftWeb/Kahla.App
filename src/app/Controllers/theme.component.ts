import { Component, ElementRef, OnInit } from '@angular/core';
import { Themes } from '../Models/Themes';
import { ThemeService } from '../Services/ThemeService';

@Component({
    templateUrl: '../Views/theme.html',
    styleUrls: ['../Styles/menu.scss'],
})
export class ThemeComponent implements OnInit {
    constructor(
        private elementRef: ElementRef,
        private themeService: ThemeService
    ) {
    }

    currentTheme: Themes = Themes.kahlaLight;

    ngOnInit(): void {
        this.currentTheme = this.themeService.LocalThemeSetting;
    }

    changeTheme(theme: Themes) {
        if (this.currentTheme === theme) {return; }
        this.currentTheme = theme;
        this.themeService.LocalThemeSetting = theme;
        this.themeService.SetRemoteThemeSetting(theme);
        this.themeService.ApplyTheme(this.elementRef, theme);
    }
}
