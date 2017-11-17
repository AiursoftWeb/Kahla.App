import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { CacheService } from '../Services/CacheService';
import { Location } from '@angular/common';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.css']
})

export class UserComponent implements OnInit {
    public info: KahlaUser;
    public conversationId: number;
    public areFriends: boolean;
    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService,
        private location: Location
    ) { }

    public ngOnInit(): void {
        this.route.params
            .switchMap((params: Params) => this.apiService.UserDetail(params['id']))
            .subscribe(response => {
                this.info = response.user;
                this.conversationId = response.conversationId;
                this.areFriends = response.areFriends;
            });
    }
    public delete(id: string): void {
        this.apiService.DeleteFriend(id)
            .subscribe(response => {
                swal('Success', response.message, 'success');
                this.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                this.router.navigate(['/kahla/friends']);
            });
    }

    public request(id: string): void {
        this.apiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    swal('Success', response.message, 'success');
                } else {
                    swal('Error', response.message, 'error');
                }
                this.location.back();
            });
    }

    public talk(id: number): void {
        this.router.navigate(['/kahla/talking', id]);
    }
}
