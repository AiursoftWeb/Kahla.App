import { Component, OnDestroy, HostListener } from '@angular/core';
import { OnInit } from '@angular/core';
import { InitService } from '../Services/InitService';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-kahla',
    templateUrl: '../Views/app.html',
    styleUrls: ['../Styles/app.css']
})


export class AppComponent implements OnInit, OnDestroy {
    constructor(
        public initService: InitService) {
    }

    @HostListener('window:popstate', [])
    onPopstate() {
        Swal.close();
    }

    public ngOnInit(): void {
        this.initService.init();
    }

    public ngOnDestroy(): void {
    }
}
