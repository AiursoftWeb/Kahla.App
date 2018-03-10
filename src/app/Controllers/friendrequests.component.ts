import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { Request } from '../Models/Request';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import 'sweetalert';

@Component({
    templateUrl: '../Views/friendrequests.html',
    styleUrls: ['../Styles/friendrequests.css']
})
export class FriendRequestsComponent implements OnInit, OnDestroy {

    public requests: Request[];

    constructor(
        private apiService: ApiService,
        private location: Location,
        private cache: CacheService
    ) {
        AppComponent.CurrentFriendRequests = this;
        this.requests = this.cache.GetFriendRequests();
    }

    public ngOnInit(): void {
        this.apiService.MyRequests()
            .subscribe(response => {
                this.requests = response.items;
                this.cache.UpdateFriendRequests(response.items);
            });
    }

    public accept(id: number): void {
        this.apiService.CompleteRequest(id, true)
            .subscribe(r => {
                swal('Success', r.message, 'success');
                this.ngOnInit();
            });
    }

    public decline(id: number): void {
        this.apiService.CompleteRequest(id, false)
            .subscribe(r => {
                swal('Success', r.message, 'success');
                this.ngOnInit();
            });
    }

    public goBack(): void {
        this.location.back();
    }

    public ngOnDestroy(): void {
        AppComponent.CurrentFriendRequests = null;
    }
}
