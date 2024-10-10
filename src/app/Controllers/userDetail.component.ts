import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../Services/Api/AuthApiService';
import { UploadService } from '../Services/UploadService';
import { KahlaUser } from '../Models/KahlaUser';
import { AiurProtocol } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { CacheService } from '../Services/CacheService';

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
    ) {
    }

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
        this.authApiService.UpdateMe({
            nickName: this.user.nickName,
            bio: this.user.bio,
        })
            .subscribe((response) => {
                if (response.code > 0) {
                    this.cacheService.cachedData.me = Object.assign({}, this.user);
                    this.cacheService.saveCache();
                    this.router.navigate(['/home']);
                } else {
                    Swal.fire('Error', (response as AiurProtocol as AiurCollection<string>).items.join('<br/>'), 'error');
                }
                saveButton.textContent = 'Save';
            });
    }
}
