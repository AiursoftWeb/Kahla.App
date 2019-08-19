import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.scss',
        '../Styles/menu.scss',
        '../Styles/button.scss']
})

export class AboutComponent {
    public sourceCodeURL = Values.sourceCodeURL;
    constructor(
        public checkService: CheckService
    ) {
    }

    public check(): void {
        this.checkService.checkVersion(true);
    }
}
