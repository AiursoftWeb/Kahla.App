import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css',
        '../Styles/button.css']
})

export class AboutComponent {
    constructor(
        public checkService: CheckService
    ) { }

    public check(): void {
        this.checkService.checkVersion(true);
    }
}
