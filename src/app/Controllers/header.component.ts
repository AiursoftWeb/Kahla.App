import { Component } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.css']
})
export class HeaderComponent {
    public macOSElectron = false;

    constructor(
        public headerService: HeaderService,
        private router: Router) {
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.includes('electron') && userAgent.includes('macintosh')) {
                this.macOSElectron = true;
            }
    }

    public goBack(): void {
        if (history.length === 1 || history.state.navigationId === 1) {
            this.router.navigate(['/conversations']);
        } else {
            history.back();
        }
    }
}
