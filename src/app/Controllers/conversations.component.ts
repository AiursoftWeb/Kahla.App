import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthApiService } from '../Services/AuthApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.css',
                '../Styles/reddot.css',
                '../Styles/button.css']
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
            this.headerService.shadow = false;
        }

    public ngOnInit(): void {
        if (this.messaageService.me) {
            this.cacheService.autoUpdateConversation();
        }
        setTimeout(() => {
            window.scroll(0, 0);
        }, 0);
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public talk(id: number): void {
        this.router.navigate(['/talking', id]);
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }
}
