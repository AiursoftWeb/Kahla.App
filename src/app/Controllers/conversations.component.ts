import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.sass',
                '../Styles/reddot.sass',
                '../Styles/button.sass']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private router: Router,
        public cacheService: CacheService,
        private messageService: MessageService,
        private headerService: HeaderService) {
            this.headerService.title = 'Kahla';
            this.headerService.returnButton = false;
            this.headerService.button = true;
            this.headerService.routerLink = '/localsearch';
            this.headerService.buttonIcon = 'search';
            this.headerService.shadow = false;
        }

    public ngOnInit(): void {
        if (this.messageService.me) {
            this.cacheService.UpdateConversation();
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

    public talk(id: number, unread: number): void {
        if (unread > 0 && unread <= 50) {
            this.router.navigate(['/talking', id, unread]);
        } else {
            this.router.navigate(['/talking', id]);
        }
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }
}
