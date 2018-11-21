import { Component } from '@angular/core';
import { HeaderService } from '../Services/HeaderService';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.css']
})
export class HeaderComponent {
    constructor(
        public headerService: HeaderService,
        private router: Router) {
    }

    public goBack(): void {
        if (history.state.navigationId === 1) {
            this.router.navigate(['/conversations']);
        } else {
            history.back();
        }
    }
}
