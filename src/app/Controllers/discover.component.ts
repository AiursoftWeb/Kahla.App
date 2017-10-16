import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { Notify } from '../Services/Notify';

@Component({
    templateUrl: '../Views/discover.html',
    styleUrls: ['../Styles/menu.css']
})
export class DiscoverComponent implements OnInit {
    constructor(
        private apiService: ApiService,
        private location: Location,
        private noti: Notify) {
    }

    public ngOnInit(): void {
    }
}
