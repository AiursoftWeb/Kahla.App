import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.sass',
        '../Styles/menu.sass',
        '../Styles/button.sass']
})

export class AboutComponent {
    public sourceCodeURL = Values.sourceCodeURL;
    constructor(
        public checkService: CheckService,
        private headerService: HeaderService
    ) {
        this.headerService.title = 'About';
        this.headerService.returnButton = true;
        this.headerService.button = false;
        this.headerService.shadow = false;
    }

    public check(): void {
        this.checkService.checkVersion(true);
    }
}
