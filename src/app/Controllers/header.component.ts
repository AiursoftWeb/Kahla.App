import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { HeaderService } from '../Services/HeaderService';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.css']
})
export class HeaderComponent {
    constructor(
        private location: Location,
        public headerService: HeaderService) {
    }

    public goBack(): void {
        this.location.back();
    }
}
