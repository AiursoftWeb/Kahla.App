import { Component, OnInit, ElementRef } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { Themes } from '../Models/Themes';
import { ThemeService } from '../Services/ThemeService';

@Component({
    templateUrl: '../Views/theme.html',
    styleUrls: ['../Styles/menu.css'],
})
export class ThemeComponent implements OnInit {
    constructor(
        private headerService: HeaderService,
        private elementRef: ElementRef,
        private themeService: ThemeService
    ) {
        this.headerService.title = 'Theme';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    currentTheme: Themes = Themes.light;

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
