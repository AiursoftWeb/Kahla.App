import { Component } from '@angular/core';
import { CacheService } from '../Services/CacheService';

@Component({
    selector: 'app-nav',
    templateUrl: '../Views/nav.html',
    styleUrls: [
        '../Styles/nav.sass',
        '../Styles/reddot.sass'
    ]
})
export class NavComponent {
    constructor(
        public cacheService: CacheService
    ) { }
}
