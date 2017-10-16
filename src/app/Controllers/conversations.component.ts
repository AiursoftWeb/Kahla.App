import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from '../Services/ApiService';
import { ContactInfo } from '../Models/ContactInfo';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { DatePipe } from '@angular/common';
import { CacheService } from '../Services/CacheService';

@Component({
    templateUrl: '../Views/conversations.html',
    styleUrls: ['../Styles/conversations.css']
})
export class ConversationsComponent implements OnInit, OnDestroy {
    public info: ContactInfo[];
    constructor(
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService) {
        AppComponent.CurrentConversation = this;
        if (this.cache.GetConversations()) {
            this.info = this.cache.GetConversations();
        }
    }
    public ngOnInit(): void {
        this.apiService.MyFriends(false)
            .map(t => t.items)
            .subscribe(info => {
                this.info = info;
                this.cache.UpdateConversations(info);
                AppComponent.CurrentNav.ngOnInit();
            });
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/kahla/group', info.conversationId]);
        } else {
            this.router.navigate(['/kahla/user', info.userId]);
        }
    }

    public talk(id: number): void {
        this.router.navigate(['/kahla/talking', id]);
    }

    public ngOnDestroy(): void {
        AppComponent.CurrentConversation = null;
    }
}
