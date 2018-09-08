import { Component, OnInit } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { versions } from '../../environments/versions';
import 'sweetalert';
import { AppComponent } from './app.component';
@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css']
})

export class AboutComponent implements OnInit {
    public checking = false;
    public version = versions.version;
    public revision = versions.revision;
    public branch = versions.branch;
    public buildTime = versions.buildTime;
    constructor(
        private apiService: ApiService,
        private appComponent: AppComponent
    ) { }

    public ngOnInit(): void {
    }

    public check(): void {
        this.apiService.Version()
            .subscribe(t => {
                const latestVersion: Array<string> = t.latestVersion.split('.');
                const currentVersion: Array<string> = this.version.split('.');
                const downloadAddress: string = t.downloadAddress;
                if (latestVersion[0] > currentVersion[0]) {
                    this.appComponent.redirectToDownload(downloadAddress);
                } else if (latestVersion[1] > currentVersion[1]) {
                    this.appComponent.redirectToDownload(downloadAddress);
                } else if (latestVersion[2] > currentVersion[2]) {
                    this.appComponent.redirectToDownload(downloadAddress);
                } else {
                    swal('Alert', `You are running the latest version of Kahla!`, 'success');
                }
                this.checking = false;
            });
        this.checking = true;
    }
}
