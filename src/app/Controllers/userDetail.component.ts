import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { UploadService } from '../Services/UploadService';
import { KahlaUser } from '../Models/KahlaUser';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';
import { ProbeService } from '../Services/ProbeService';

@Component({
    templateUrl: '../Views/userDetail.html',
    styleUrls: [
        '../Styles/userDetail.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss'
    ]
})

export class UserDetailComponent implements OnInit {
    public user: KahlaUser;
    public loadingImgURL = Values.loadingImgURL;
    @ViewChild('imageInput') public imageInput;

    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        public uploadService: UploadService,
        public cacheService: CacheService,
        private probeService: ProbeService,
    ) {
    }

    public ngOnInit(): void {
        if (!this.cacheService.cachedData.me) {
            this.authApiService.Me().subscribe(p => {
                this.user = p.value;
                this.user.avatarURL = this.probeService.encodeProbeFileUrl(this.user.iconFilePath);
            });
        } else {
            this.user = Object.assign({}, this.cacheService.cachedData.me);
        }
    }

    public uploadAvatar(): void {
        if (this.imageInput) {
            const fileBrowser = this.imageInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                this.uploadService.uploadAvatar(this.user, fileBrowser.files[0]);
            }
        }
    }

    public save(): void {
        const saveButton = document.querySelector('#save');
        saveButton.textContent = 'Saving...';
        this.authApiService.UpdateInfo(this.user.nickName, this.user.bio, this.user.iconFilePath)
            .subscribe((response) => {
                if (response.code === 0) {
                    this.cacheService.cachedData.me = Object.assign({}, this.user);
                    this.cacheService.saveCache();
                    this.router.navigate(['/home']);
                } else {
                    Swal.fire('Error', (response as AiurProtocal as AiurCollection<string>).items[0], 'error');
                }
                saveButton.textContent = 'Save';
            });
    }
}
