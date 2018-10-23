import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css',
        '../Styles/button.css']
})

export class AboutComponent {
    public sourceCodeURL = Values.sourceCodeURL;
    constructor(
        public checkService: CheckService
    ) { }

    public check(): void {
        this.checkService.checkVersion(true);
    }
}
