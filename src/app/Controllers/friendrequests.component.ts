import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { Location } from '@angular/common';
import { Request } from '../Models/Request';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';

@Component({
    templateUrl: '../Views/friendrequests.html',
    styleUrls: ['../Styles/friendrequests.css']
})
export class FriendRequestsComponent implements OnInit, OnDestroy {

    public requests: Request[];
    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

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
                response.items.forEach(item => {
                    item.createTime = new Date(item.createTime).toLocaleString([], this.option);
                });
                this.requests = response.items;
                this.cache.UpdateFriendRequests(response.items);
            });
    }

    public accept(id: number): void {
        this.apiService.CompleteRequest(id, true)
            .subscribe(r => {
                Swal('Success', r.message, 'success');
                this.ngOnInit();
            });
    }

    public decline(id: number): void {
        this.apiService.CompleteRequest(id, false)
            .subscribe(r => {
                Swal('Success', r.message, 'success');
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
