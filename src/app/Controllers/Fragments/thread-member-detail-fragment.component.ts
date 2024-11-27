import { Component, input, output } from '@angular/core';
import { ThreadInfoJoined } from '../../Models/Threads/ThreadInfo';
import { ThreadMemberInfo } from '../../Models/Threads/ThreadMemberInfo';
import { ThreadsApiService } from '../../Services/Api/ThreadsApiService';
import Swal from 'sweetalert2';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../../Utils/CommonErrorDialog';
import { SwalToast } from '../../Utils/Toast';
import { Router } from '@angular/router';

@Component({
    selector: 'app-thread-member-detail-fragment',
    templateUrl: '../../Views/Fragments/thread-member-detail-fragment.html',
    standalone: false,
    styleUrls: ['../../Styles/menu.scss'],
})
export class ThreadMemberDetailFragmentComponent {
    threadInfo = input.required<ThreadInfoJoined>();
    memberInfo = input.required<ThreadMemberInfo>();

    returned = output();

    constructor(private threadsApiService: ThreadsApiService, private router: Router) {}

    async removeMember() {
        if (
            (
                await Swal.fire({
                    title: 'Remove Member',
                    text: `Are you sure you want to remove ${this.memberInfo().user.nickName} (id: ${this.memberInfo().user.id}) from the thread?`,
                    icon: 'warning',
                    showCancelButton: true,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.KickMember(this.threadInfo().id, this.memberInfo().user.id)
            );

            SwalToast.fire('Member removed!');
            this.returned.emit();
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }

    async promoteAdmin(promote: boolean) {
        if (
            (
                await Swal.fire({
                    title: promote ? 'Promote to Admin' : 'Demote from Admin',
                    text: `Are you sure you want to ${promote ? 'promote' : 'demote'} ${this.memberInfo().user.nickName} (id: ${this.memberInfo().user.id})?`,
                    icon: 'warning',
                    showCancelButton: true,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.PromoteAdmin(
                    this.threadInfo().id,
                    this.memberInfo().user.id,
                    promote
                )
            );
            SwalToast.fire(`Member ${promote ? 'promoted' : 'demoted'}!`);
            this.memberInfo().isAdmin = promote;

        } catch (err) {
            showCommonErrorDialog(err);
        }
    }

    async transferOwnership() {
        if (
            (
                await Swal.fire({
                    title: 'Transfer Ownership',
                    text: `Are you sure you want to transfer ownership to ${this.memberInfo().user.nickName} (id: ${this.memberInfo().user.id})?`,
                    icon: 'warning',
                    showCancelButton: true,
                })
            ).isDismissed
        )
            return;
        try {
            await lastValueFrom(
                this.threadsApiService.TransferOwnership(
                    this.threadInfo().id,
                    this.memberInfo().user.id
                )
            );
            SwalToast.fire('Ownership transferred!');
            this.router.navigate(['/thread', this.threadInfo().id], {replaceUrl: true});

        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
