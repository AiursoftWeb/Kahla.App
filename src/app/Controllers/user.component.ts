import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { SwalToast } from '../Utils/Toast';
import { ContactsApiService } from '../Services/Api/ContactsApiService';
import { ContactInfo } from '../Models/Contacts/ContactInfo';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';
import { BlocksApiService } from '../Services/Api/BlocksApiService';
import { UserDetailViewModel } from '../Models/ApiModels/UserDetailViewModel';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { CommonThreadRepository } from '../Repositories/CommonThreadsRepository';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/button.scss',
        '../Styles/reddot.scss',
        '../Styles/badge.scss',
    ],
    standalone: false,
})
export class UserComponent implements OnInit {
    public info: ContactInfo;
    public response: UserDetailViewModel;
    public loadingImgURL = Values.loadingImgURL;
    public isCommonThreadsShown = false;
    public commonThreadsRepo?: CommonThreadRepository;
    public contextThreadId?: number;

    constructor(
        private route: ActivatedRoute,
        private contactsApiService: ContactsApiService,
        private threadsApiService: ThreadsApiService,
        private blocksApiService: BlocksApiService,
        private router: Router,
        private myContactsRepository: MyContactsRepository
    ) {}

    public ngOnInit(): void {
        this.route.params.subscribe(t => {
            this.updateFriendInfo(t.id);
            this.isCommonThreadsShown = false;
            this.commonThreadsRepo = null;
        });
    }

    public updateFriendInfo(userId: string) {
        this.contactsApiService.Details(userId, 0, 0).subscribe(response => {
            this.info = response.searchedUser;
            this.response = response;
        });
    }

    public async delete(id: string) {
        const resp = await Swal.fire({
            title: 'Are you sure to delete a friend?',
            icon: 'warning',
            showCancelButton: true,
        });
        if (!resp.value) return;
        try {
            await lastValueFrom(this.contactsApiService.Remove(id));
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }
        SwalToast.fire('Success', '', 'success');
        this.myContactsRepository.updateAll();
        this.router.navigate(['/home']);
    }

    public async addAsContract() {
        try {
            await lastValueFrom(this.contactsApiService.Add(this.info.user.id));
            SwalToast.fire('Success', '', 'success');
            this.updateFriendInfo(this.info.user.id);
            this.myContactsRepository.updateAll();
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }

    public async report() {
        const resp = await Swal.fire({
            title: 'Report',
            input: 'textarea',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
                maxlength: '200',
            },
            confirmButtonColor: 'red',
            showCancelButton: true,
            confirmButtonText: 'Report',
            inputValidator: inputValue => {
                if (!inputValue || inputValue.length < 5) {
                    return "The reason's length should between five and two hundreds.";
                }
            },
        });
        if (!resp.value) return;
        try {
            await lastValueFrom(this.contactsApiService.Report(this.info.user.id, resp.value));
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }
    }

    public shareUser() {
        // this.router.navigate(['/share-target', {message: `[user]${this.info.id}`}]);
    }

    public message() {
        this.router.navigate([`/talking/${this.response.defaultThread!}`]);
    }

    public async newThread() {
        // hard invite
        const resp = await lastValueFrom(this.threadsApiService.HardInvite(this.info.user.id));
        SwalToast.fire('Thread Created.', '', 'success');
        this.router.navigate([`/talking/${resp.newThreadId}`]);
    }

    public async block() {
        const resp = await Swal.fire({
            title: `Are you sure to ${this.info.isBlockedByYou ? 'unblock' : 'block'} this user?`,
            text: `Blocked user will not be able to create new threads with you.`,
            icon: 'warning',
            showCancelButton: true,
        });
        if (!resp.value) return;
        try {
            await lastValueFrom(
                this.info.isBlockedByYou
                    ? this.blocksApiService.Remove(this.info.user.id)
                    : this.blocksApiService.Block(this.info.user.id)
            );
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }
        SwalToast.fire('Success', '', 'success');
        this.updateFriendInfo(this.info.user.id);
        this.myContactsRepository.updateAll();
    }

    public showCommonThreads() {
        this.isCommonThreadsShown = !this.isCommonThreadsShown;
        if (this.isCommonThreadsShown && !this.commonThreadsRepo) {
            this.commonThreadsRepo = new CommonThreadRepository(
                this.contactsApiService,
                this.info.user.id
            );
            this.commonThreadsRepo.updateAll();
        }
    }
}
