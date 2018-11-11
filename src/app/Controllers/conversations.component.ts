import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import * as PullToRefresh from 'pulltorefreshjs';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.css', '../Styles/reddot.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        public authApiService: AuthApiService,
        public router: Router,
        public cacheService: CacheService,
        public messaageService: MessageService,
        private headerService: HeaderService) {
            this.headerService.title = 'Kahla';
            this.headerService.returnButton = false;
            this.headerService.button = true;
            this.headerService.routerLink = '/addfriend';
            this.headerService.buttonIcon = 'search';
    }

    public ngOnInit(): void {
        PullToRefresh.destroyAll();
        PullToRefresh.init({
            distMax: 120,
            mainElement: '#main',
            // passive: true,
            refreshTimeout: 200,
            onRefresh: function (done) {
                this.cacheService.autoUpdateConversation(function () {
                    done();
                });
            }
        });
        if (this.messaageService.me) {
            this.cacheService.autoUpdateConversation(null);
        }
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public talk(id: number): void {
        PullToRefresh.destroyAll();
        this.router.navigate(['/talking', id]);
    }

    public ngOnDestroy(): void {
        PullToRefresh.destroyAll();
        this.loadingImgURL = null;
    }
}
