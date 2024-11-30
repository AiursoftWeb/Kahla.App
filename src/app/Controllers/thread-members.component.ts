import { Component, computed, input, resource, signal } from '@angular/core';
import { ThreadMembersRepository } from '../Repositories/ThreadMembersRepository';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { ThreadInfoCacheDictionary } from '../Caching/ThreadInfoCacheDictionary';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ContactInfo } from '../Models/Contacts/ContactInfo';
import { MappedRepository } from '../Repositories/RepositoryBase';
import { ContactListItem } from './contact-list.component';
import { lastValueFrom } from 'rxjs';
import { SwalToast, YesNoDialog, YesNoDialogSerious } from '../Utils/Toast';
import { Router } from '@angular/router';
import { ThreadMemberInfo } from '../Models/Threads/ThreadMemberInfo';

@Component({
    selector: 'app-thread-members',
    templateUrl: '../Views/thread-members.html',
    styleUrls: ['../Styles/thread-members.scss', '../Styles/popups.scss'],
    standalone: false,
})
export class ThreadMembersComponent {
    id = input.required<number>();
    repo = resource({
        request: () => this.id(),
        loader: async ({ request: id }) => {
            const repo = new ThreadMembersRepository(this.threadsApiService, id);
            await repo.updateAll().catch(showCommonErrorDialog);
            return repo;
        },
    });

    mappedRepo = computed(() => {
        if (this.repo.value()) {
            return new MappedRepository<ContactListItem, ThreadMemberInfo>(
                this.repo.value(),
                t => ({
                    ...t,
                    tags: [
                        ...(t.isOwner ? ([{ desc: 'Owner', type: 'owner' }] as const) : []),
                        ...(t.isAdmin ? ([{ desc: 'Admin', type: 'admin' }] as const) : []),
                    ],
                })
            );
        }
    });

    threadInfo = resource({
        request: () => this.id(),
        loader: async ({ request: id }) =>
            await this.threadInfoCacheDictionary.get(id).catch(showCommonErrorDialog),
    });

    viewingDetail = signal<ThreadMemberInfo>(null);

    viewDetail(inf: ContactInfo) {
        this.viewingDetail.set(inf as ThreadMemberInfo);
    }

    constructor(
        private threadsApiService: ThreadsApiService,
        private threadInfoCacheDictionary: ThreadInfoCacheDictionary,
        private router: Router
    ) {}

    async removeMember() {
        if (
            (
                await YesNoDialog.fire({
                    title: 'Remove Member',
                    text: `Are you sure you want to remove ${this.viewingDetail().user.nickName} (id: ${this.viewingDetail().user.id}) from the thread?`,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.KickMember(
                    this.threadInfo.value().id,
                    this.viewingDetail().user.id
                )
            );
            SwalToast.fire('Member removed!');
            this.repo.value().data = this.repo
                .value()
                .data.filter(x => x.user.id !== this.viewingDetail().user.id);
            this.repo.value().total--;
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }

    async promoteAdmin(promote: boolean) {
        if (
            (
                await YesNoDialog.fire({
                    title: promote ? 'Promote to Admin' : 'Demote from Admin',
                    text: `Are you sure you want to ${promote ? 'promote' : 'demote'} ${this.viewingDetail().user.nickName} (id: ${this.viewingDetail().user.id})?`,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.PromoteAdmin(
                    this.threadInfo.value().id,
                    this.viewingDetail().user.id,
                    promote
                )
            );
            SwalToast.fire(`Member ${promote ? 'promoted' : 'demoted'}!`);
            this.repo.value().data.find(x => x.user.id === this.viewingDetail().user.id).isAdmin =
                promote;
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }

    async transferOwnership() {
        if (
            (
                await YesNoDialogSerious.fire({
                    title: 'Transfer Ownership',
                    text: `Are you sure you want to transfer ownership to ${this.viewingDetail().user.nickName} (id: ${this.viewingDetail().user.id})?`,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.TransferOwnership(
                    this.threadInfo.value().id,
                    this.viewingDetail().user.id
                )
            );
            SwalToast.fire('Ownership transferred!');
            this.router.navigate(['/thread', this.threadInfo.value().id], { replaceUrl: true });
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
