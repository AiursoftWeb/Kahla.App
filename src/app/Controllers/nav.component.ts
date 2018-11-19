import { Component } from '@angular/core';
import { CacheService } from '../Services/CacheService';

@Component({
    selector: 'app-nav',
    templateUrl: '../Views/nav.html',
    styleUrls: ['../Styles/nav.css', '../Styles/reddot.css']
})
export class NavComponent {
    constructor(
        public cacheService: CacheService
    ) { }
}
