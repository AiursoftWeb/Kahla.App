import { Injectable } from '@angular/core';
import { GroupsResult } from '../Models/GroupsResults';
import Swal from 'sweetalert2';
import { CacheService } from './CacheService';
import { GroupsApiService } from './Api/GroupsApiService';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class FriendshipService {
    constructor(
        private cacheService: CacheService,
        private groupsApiService: GroupsApiService,
        private router: Router
    ) {}

    public joinGroup(group: GroupsResult, askWhenNoPwd: boolean = false) {
        if (group.hasPassword) {
            Swal.fire({
                title: 'Enter group password.',
                input: 'text',
                inputAttributes: {
                    maxlength: '100',
                },
                inputValidator: value => {
                    if (!value) {
                        return 'You need to enter the join password.';
                    }
                },
                showCancelButton: true,
                confirmButtonText: 'Join',
            }).then(result => {
                if (result.value) {
                    this.joinGroupWithPassword(group.name, result.value as string, group.id);
                }
            });
        } else if (askWhenNoPwd) {
            Swal.fire({
                title: 'Are you sure to join the group?',
                text: group.name,
                showCancelButton: true,
                icon: 'question',
            }).then(result => {
                if (!result.dismiss) {
                    this.joinGroupWithPassword(group.name, '', group.id);
                }
            });
        } else {
            this.joinGroupWithPassword(group.name, '', group.id);
        }
    }

    private joinGroupWithPassword(groupName: string, password: string, id: number) {
        this.groupsApiService.JoinGroup(groupName, password).subscribe(response => {
            if (response.code === 0) {
                this.cacheService.updateConversation();
                this.router.navigate(['/talking/' + id]);
            } else {
                Swal.fire('Error', response.message, 'error');
            }
        });
    }
}
