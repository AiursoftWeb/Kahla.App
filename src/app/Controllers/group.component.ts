import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import { switchMap, map } from 'rxjs/operators';
import { Conversation } from '../Models/Conversation';
import 'sweetalert';

@Component({
    templateUrl: '../Views/group.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/friends.css']
})

export class GroupComponent implements OnInit {
    public conversation: Conversation;
    public groupMumbers: number;
    private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };

    constructor(
        private route: ActivatedRoute,
        private apiService: ApiService,
        private router: Router,
        private cache: CacheService
    ) { }

    public ngOnInit(): void {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.apiService.ConversationDetail(+params['id'])),
                map(t => t.value)
            )
            .subscribe(conversation => {
                this.conversation = conversation;
                this.conversation.conversationCreateTime =
                    new Date(this.conversation.conversationCreateTime).toLocaleString([], this.option);
                this.groupMumbers = conversation.users.length;
            });
    }

    public leaveGroup(groupName: string): void {
        swal({
            title: 'Are you sure to leave this group?',
            icon: 'warning',
            buttons: ['Cancel', true],
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    this.apiService.LeaveGroup(groupName)
                        .subscribe(response => {
                            if (response.code === 0) {
                                swal('Success', response.message, 'success');
                                this.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                                this.router.navigate(['/kahla/friends']);
                            } else {
                                swal('Error', response.message, 'error');
                            }
                        });
                }
            });
    }

    public talk(id: number): void {
        this.router.navigate(['/kahla/talking', id]);
    }

    public user(id: string): void {
        this.router.navigate(['kahla/user', id]);
    }
}
