import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from '../Services/MessageService';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UploadService } from '../Services/UploadService';
import { CacheService } from '../Services/CacheService';
import { ProbeService } from '../Services/ProbeService';

@Component({
    templateUrl: '../Views/manageGroup.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/menu-textbox.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss',
    ],
    standalone: false,
})
export class ManageGroupComponent implements OnInit {
    @ViewChild('imageInput') public imageInput;
    public newGroupName: string;

    constructor(
        public messageService: MessageService,
        public cacheService: CacheService,
        public route: ActivatedRoute,
        private router: Router,
        public uploadService: UploadService,
        private probeService: ProbeService
    ) {}

    ngOnInit(): void {
    }

    public transferOwner(): void {
        const inputOptions = {};
        // this.conversation.users.forEach(val => {
        //     if (val.user.id !== this.cacheService.cachedData.me.id) {
        //         inputOptions[val.user.id] = val.user.nickName;
        //     }
        // });

        Swal.fire({
            title: 'Transfer owner to',
            input: 'select',
            inputOptions: inputOptions,
            showCancelButton: true,
        }).then(willTransfer => {
            if (willTransfer.value) {
                Swal.fire({
                    title: 'Transfer ownership?',
                    html:
                        'You are transferring your ownership to <br/> ' +
                        `<b>${inputOptions[willTransfer.value as string]}(id:${willTransfer.value})</b> <br/> ` +
                        'This operation CANNOT be undone! are you sure to continue?',
                    showCancelButton: true,
                    icon: 'warning',
                }).then(res => {
                    if (!res.dismiss) {
                        
                    }
                });
            }
        });
    }

    public changePasswd() {
        Swal.fire({
            title: 'Set your new join password',
            text: 'leave the input box empty to remove the password.',
            input: 'text',
            inputAttributes: {
                maxlength: '100',
            },
            showCancelButton: true,
        }).then(result => {
            if (result.dismiss) {
                return;
            }
            // this.groupsApiService
            //     .UpdateGroupPassword(this.conversation.groupName, result.value as string)
            //     .subscribe(res => {
            //         if (res.code === 0) {
            //             Swal.fire('Success', res.message, 'success');
            //         } else {
            //             Swal.fire('Error', res.message, 'error');
            //         }
            //     });
        });
    }

    public uploadAvatar() {
        // if (this.imageInput) {
        //     const fileBrowser = this.imageInput.nativeElement;
        //     if (fileBrowser.files && fileBrowser.files[0]) {
        //         this.uploadService.uploadGroupAvater(this.conversation, fileBrowser.files[0]);
        //     }
        // }
    }

    public saveInfo() {
        // this.groupsApiService
        //     .UpdateGroupInfo(
        //         this.conversation.groupName,
        //         this.conversation.listInSearchResult,
        //         this.conversation.groupImagePath,
        //         this.newGroupName
        //     )
        //     .subscribe(res => {
        //         if (res.code === 0) {
        //             SwalToast.fire('Success', '', 'success');
        //             this.conversation.groupName = this.newGroupName;
        //         } else if (res.code === -10 && (res as AiurCollection<string>).items) {
        //             Swal.fire(
        //                 'Error',
        //                 (res as AiurCollection<string>).items.join('<br/>'),
        //                 'error'
        //             );
        //         } else {
        //             Swal.fire('Error', res.message, 'error');
        //         }
        //     });
    }

    public kickMember() {
        const inputOptions = {};
        // this.conversation.users.forEach(val => {
        //     if (val.user.id !== this.cacheService.cachedData.me.id) {
        //         inputOptions[val.user.id] = val.user.nickName;
        //     }
        // });

        Swal.fire({
            title: 'Kick member',
            input: 'select',
            inputOptions: inputOptions,
            showCancelButton: true,
        }).then(result => {
            if (result.value) {
                Swal.fire({
                    title: 'Kick member?',
                    html:
                        'Are you sure to kick out ' +
                        `<b>${inputOptions[result.value as string]}(id:${result.value})</b>?`,
                    showCancelButton: true,
                    icon: 'warning',
                }).then(confirmAlert => {
                    if (!confirmAlert.dismiss) {
                        // this.groupsApiService
                        //     .KickMember(this.conversation.groupName, result.value as string)
                        //     .subscribe(response => {
                        //         if (response.code === 0) {
                        //             Swal.fire('Success', response.message, 'success');
                        //         } else {
                        //             Swal.fire('Error', response.message, 'error');
                        //         }
                        //     });
                    }
                });
            }
        });
    }

    public dissolveGroup() {
        Swal.fire({
            title: 'Dissolve Group?',
            icon: 'warning',
            html: `Are you sure to dissolve group <b>GROUP NAME?</b><br>This Operation CANNOT be undone!`,
            showCancelButton: true,
            focusCancel: true,
        }).then(alertConfirm => {
            if (!alertConfirm.dismiss) {
                // this.groupsApiService
                //     .DissolveGroup(this.conversation.groupName)
                //     .subscribe(result => {
                //         if (result.code === 0) {
                //             Swal.fire('Success', result.message, 'success');
                //             this.router.navigate(['/home']);
                //         } else {
                //             Swal.fire('Error', result.message, 'error');
                //         }
                //     });
            }
        });
    }
}
