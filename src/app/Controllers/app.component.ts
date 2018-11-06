import { Component, OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        public initService: InitService) {
    }

    public ngOnInit(): void {
        this.initService.init();
    }

    public ngOnDestroy(): void {
    }
}
