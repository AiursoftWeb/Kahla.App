﻿import { AfterViewInit, Component, effect, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';
import { GroupsResult } from '../Models/GroupsResults';
import { ContactInfo } from '../Models/Contacts/ContactInfo';
import {
    MyContactsRepository,
    MyContactsRepositoryFiltered,
} from '../Repositories/MyContactsRepository';
import { RepositoryBase } from '../Repositories/RepositoryBase';
import { ContactsApiService } from '../Services/Api/ContactsApiService';

@Component({
    selector: 'app-friends',
    templateUrl: '../Views/friends.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/reddot.scss',
        '../Styles/search-part.scss',
        '../Styles/friends.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss',
    ],
})
export class FriendsComponent implements OnInit, AfterViewInit {
    public loadingImgURL = Values.loadingImgURL;
    public showUsers = true;
    public searchTxt = signal('');

    private detailLoading = false;
    public contactsRepo: RepositoryBase<ContactInfo>;

    constructor(
        private router: Router,
        public cacheService: CacheService,
        public myContactsRepository: MyContactsRepository,
        contactsApiService: ContactsApiService
    ) {
        effect(() => {
            if (this.searchTxt().length > 0) {
                this.contactsRepo = new MyContactsRepositoryFiltered(
                    contactsApiService,
                    this.searchTxt()
                );
                this.contactsRepo.updateAll();
            } else {
                this.contactsRepo = this.myContactsRepository;
            }
        });
    }

    public ngOnInit(): void {
        if (this.cacheService.cachedData.me && this.myContactsRepository.health) {
            this.myContactsRepository.updateAll();
        }
    }

    ngAfterViewInit(): void {
        const inputElement = document.querySelector('#searchBar') as HTMLElement;
        if (
            !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            )
        ) {
            inputElement.focus();
        }
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }

    public goSingleSearch(): void {
        // TODO
        // if (this.showUsers) {
        //     if (this.results.users.length === 1) {
        //         this.userClick(this.results.users[0], ctrl);
        //     }
        // } else {
        //     if (this.results.threads.length === 1) {
        //         this.groupClick(this.results.threads[0], ctrl);
        //     }
        // }
    }

    public userClick(user: ContactInfo, ctrl: boolean) {
        if (ctrl) {
            this.router.navigate(['/user', user.user.id]);
        } else {
            if (this.detailLoading) {
                return;
            }
            this.detailLoading = true;
            // this.friendsApiService.UserDetail(user.id).subscribe(p => {
            //     this.router.navigate(['/talking', p.conversationId]);
            //     this.detailLoading = false;
            // });
        }
    }

    public groupClick(group: GroupsResult, ctrl: boolean) {
        if (ctrl) {
            this.router.navigate(['/group', group.id]);
        } else {
            this.router.navigate(['/talking', group.id]);
        }
    }
}
