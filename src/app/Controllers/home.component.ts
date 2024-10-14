import { Component } from '@angular/core';
import { HomeService } from '../Services/HomeService';

@Component({
    selector: 'app-home',
    templateUrl: '../Views/home.html',
})
export class HomeComponent {
    constructor(public homeService: HomeService) {}
}
