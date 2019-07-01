import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from '../Services/MessageService';
import { TimerService } from '../Services/TimerService';
import { HomeService } from '../Services/HomeService';
import { ElectronService } from 'ngx-electron';
import { InitService } from '../Services/InitService';

@Component({
    selector: 'app-header',
    templateUrl: '../Views/header.html',
    styleUrls: ['../Styles/header.scss',
                '../Styles/reddot.scss']
})
export class HeaderComponent {
    @Input() public title = 'Kahla';
    @Input() public returnButton = true;
    @Input() public closeDirectly = false;
    @Input() public button = false;
    @Input() public buttonLink = '';
    @Input() public buttonIcon = '';
    @Input() public shadow = false;
    @Input() public timer = false;

    constructor(
        private router: Router,
        public timerService: TimerService,
        public messageService: MessageService,
        public homeService: HomeService,
        public _electronService: ElectronService,
        public initService: InitService
    ) {}

    public goBack(): void {
        if (history.length === 1 || history.state.navigationId === 1 || (this.homeService.wideScreenEnabled && this.closeDirectly)) {
            this.router.navigate(['/home']);
        } else {
            history.back();
        }
    }
}
