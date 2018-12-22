import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ContactInfo } from '../Models/ContactInfo';
import * as PullToRefresh from 'pulltorefreshjs';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/friends.html',
    styleUrls: ['../Styles/friends.css', '../Styles/reddot.css']

})
export class FriendsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService,
        private headerService: HeaderService) {
            this.headerService.title = 'Friends';
            this.headerService.returnButton = false;
            this.headerService.button = true;
            this.headerService.routerLink = '/addfriend';
            this.headerService.buttonIcon = 'plus';
            this.headerService.shadow = false;
    }
    public ngOnInit(): void {
        PullToRefresh.destroyAll();
        PullToRefresh.init({
            distMax: 120,
            mainElement: '#main',
            passive: true,
            refreshTimeout: 200,
            onRefresh: done => {
                this.messageService.updateFriends(function () {
                    done();
                });
            }
        });
        this.messageService.updateFriends(null);
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public ngOnDestroy(): void {
        PullToRefresh.destroyAll();
    }
}
