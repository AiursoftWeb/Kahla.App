import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MessageService } from '../Services/MessageService';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.css']
})
export class HeaderComponent {
    constructor(
        private location: Location,
        public messaageService: MessageService) {
    }

    public goBack(): void {
        this.location.back();
    }
}
