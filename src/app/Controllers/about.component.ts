import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';
import { HomeService } from '../Services/HomeService';

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
        public checkService: CheckService,
        public homeService: HomeService
    ) {
    }

    public check(): void {
        this.checkService.checkVersion(true);
    }

    public pwaAddHomeScreen(): void {
        this.homeService.pwaHomeScreenPrompt.prompt();
        this.homeService.pwaHomeScreenPrompt.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.homeService.pwaHomeScreenSuccess = true;
                }
                this.homeService.pwaHomeScreenPrompt = null;
            });
    }
}
