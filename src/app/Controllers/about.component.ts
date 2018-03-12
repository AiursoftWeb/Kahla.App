import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { CacheService } from '../Services/CacheService';
import { Location } from '@angular/common';
import { Values } from '../values';
import 'sweetalert';

@Component({
    templateUrl: '../Views/about.html',
    styleUrls: [
        '../Styles/about.css',
        '../Styles/menu.css']
})

export class AboutComponent implements OnInit {
    public checking = false;
    public version = Values.currentVersion;
    constructor(
        private apiService: ApiService,
    ) { }

    public ngOnInit(): void {
    }

    public check(): void {
        this.apiService.Version()
            .subscribe(t => {
                if (t.latestVersion === Values.currentVersion) {
                    swal('Alert', `You are running the latest version of Kahla!`, 'success');
                } else {
                    swal({
                        title: 'There is a new version of Kahla!',
                        text: 'Do you want to download the latest version of Kahla now?',
                        icon: 'info',
                        buttons: [true, 'Download now'],
                        dangerMode: false,
                    }).then(ToDownload => {
                        if (ToDownload) {
                            location.href = t.downloadAddress;
                        }
                    });
                }
                this.checking = false;
            });
        this.checking = true;
    }
}
