import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { UploadService } from '../Services/UploadService';
import { KahlaUser } from '../Models/KahlaUser';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { SwalToast } from '../Utils/Toast';
import { selectFiles } from '../Utils/SystemDialog';

@Component({
    templateUrl: '../Views/userDetail.html',
    styleUrls: ['../Styles/menu-textbox.scss', '../Styles/button.scss'],
})
export class UserDetailComponent implements OnInit {
    public user: KahlaUser;
    public loadingImgURL = Values.loadingImgURL;
    saving = false;

    constructor(
        private authApiService: AuthApiService,
        public uploadService: UploadService,
        public cacheService: CacheService
    ) {}

    public ngOnInit(): void {
        if (!this.cacheService.cachedData.me) {
            this.authApiService.Me().subscribe(p => {
                this.user = p.user;
                // this.user.avatarURL = this.probeService.encodeProbeFileUrl(this.user.iconFilePath);
            });
        } else {
            this.user = Object.assign({}, this.cacheService.cachedData.me);
        }
    }

    public async uploadAvatar() {
        const files = await selectFiles();
        if (!files) {
            return;
        }
        this.uploadService.uploadAvatar(this.user, files[0]);
    }

    public async save() {
        this.saving = true;
        try {
            await lastValueFrom(
                this.authApiService.UpdateMe({
                    nickName: this.user.nickName,
                    bio: this.user.bio,
                })
            );
            this.cacheService.cachedData.me = { ...this.user };
            this.cacheService.saveCache();
            SwalToast.fire({ title: 'Profile saved.', icon: 'success' });
        } catch (err) {
            showCommonErrorDialog(err);
        } finally {
            this.saving = false;
        }
    }
}
