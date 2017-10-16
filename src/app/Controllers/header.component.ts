import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

    @Input() public title: string;
    @Input() public returnButton: boolean;
    @Input() public Button: boolean;
    @Input() public RouterLink: string;
    @Input() public ButtonIcon: string;
    constructor(
        private apiService: ApiService,
        private location: Location) {
    }

    public ngOnInit(): void {
        AppComponent.CurrentHeader = this;
    }

    public ngOnDestroy(): void {
        AppComponent.CurrentHeader = null;
    }

    public goBack(): void {
        this.location.back();
    }
}
