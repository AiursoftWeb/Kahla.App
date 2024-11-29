import { Component, effect, input, OnInit, resource } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { SwalToast } from '../Utils/Toast';
import { ContactsApiService } from '../Services/Api/ContactsApiService';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';
import { BlocksApiService } from '../Services/Api/BlocksApiService';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { CommonThreadRepository } from '../Repositories/CommonThreadsRepository';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.scss', '../Styles/button.scss'],
    standalone: false,
})
export class UserComponent implements OnInit {
    id = input.required<string>();

    public info = resource({
        request: () => this.id(),
        loader: async ({ request: id }) => {
            try {
                return await lastValueFrom(this.contactsApiService.Details(id, 0, 0));
            } catch (err) {
                showCommonErrorDialog(err);
                return null;
            }
        },
    });
    public isCommonThreadsShown = false;
    public commonThreadsRepo?: CommonThreadRepository;

    constructor(
        private contactsApiService: ContactsApiService,
        private threadsApiService: ThreadsApiService,
        private blocksApiService: BlocksApiService,
        private router: Router,
        private myContactsRepository: MyContactsRepository
    ) {}

    public ngOnInit(): void {
        effect(() => {
            this.id();
            this.isCommonThreadsShown = false;
            this.commonThreadsRepo = null;
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
            await lastValueFrom(
                this.contactsApiService.Add(this.info.value().searchedUser.user.id)
            );
            SwalToast.fire('Success', '', 'success');
            this.info.reload();
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
            await lastValueFrom(
                this.contactsApiService.Report(this.info.value().searchedUser.user.id, resp.value)
            );
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }
    }

    public shareUser() {
        // this.router.navigate(['/share-target', {message: `[user]${this.info.id}`}]);
    }

    public message() {
        this.router.navigate([`/talking/${this.info.value().defaultThread!}`]);
    }

    public async newThread() {
        // hard invite
        const resp = await lastValueFrom(
            this.threadsApiService.HardInvite(this.info.value().searchedUser.user.id)
        );
        SwalToast.fire('Thread Created.', '', 'success');
        this.router.navigate([`/talking/${resp.newThreadId}`]);
    }

    public async block() {
        const resp = await Swal.fire({
            title: `Are you sure to ${this.info.value().searchedUser.isBlockedByYou ? 'unblock' : 'block'} this user?`,
            text: `Blocked user will not be able to create new threads with you.`,
            icon: 'warning',
            showCancelButton: true,
        });
        if (!resp.value) return;
        try {
            await lastValueFrom(
                this.info.value().searchedUser.isBlockedByYou
                    ? this.blocksApiService.Remove(this.info.value().searchedUser.user.id)
                    : this.blocksApiService.Block(this.info.value().searchedUser.user.id)
            );
        } catch (err) {
            showCommonErrorDialog(err);
            return;
        }
        SwalToast.fire('Success', '', 'success');
        this.info.reload();
        this.myContactsRepository.updateAll();
    }

    public showCommonThreads() {
        this.isCommonThreadsShown = !this.isCommonThreadsShown;
        if (this.isCommonThreadsShown && !this.commonThreadsRepo) {
            this.commonThreadsRepo = new CommonThreadRepository(
                this.contactsApiService,
                this.info.value().searchedUser.user.id
            );
            this.commonThreadsRepo.updateAll();
        }
    }
}
