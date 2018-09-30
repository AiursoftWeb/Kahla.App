import { Component, OnInit } from '@angular/core';
import { versions } from '../../environments/versions';
import { AppComponent } from './app.component';
@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css',
        '../Styles/button.css']
})

export class AboutComponent implements OnInit {
    public version = versions.version;
    public revision = versions.revision;
    public branch = versions.branch;
    public buildTime = versions.buildTime;
    constructor(
        public appComponent: AppComponent
    ) { }

    public ngOnInit(): void {
    }

    public check(): void {
        this.appComponent.check(true);
    }
}
