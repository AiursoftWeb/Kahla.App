import { Component } from '@angular/core';
import { CheckService } from '../Services/CheckService';
import { Values } from '../values';
import { ApiService } from '../Services/Api/ApiService';
import { ElectronService } from 'ngx-electron';
import { environment } from '../../environments/environment';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.scss',
        '../Styles/menu.scss',
        '../Styles/button.scss']
})

export class AboutComponent {
    public sourceCodeURL = Values.sourceCodeURL;
    public website = environment.officialServerList;

    constructor(
        public checkService: CheckService,
        public electronService: ElectronService,
        public apiService: ApiService
    ) {
    }

    public check(): void {
        this.checkService.checkVersion(true);
    }

    public getCurrentYear(): number {
        return new Date().getFullYear();
    }
}
