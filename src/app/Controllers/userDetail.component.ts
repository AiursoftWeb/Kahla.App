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
import { MeRepo } from '../Repos/MeRepo';

@Component({
    templateUrl: '../Views/userDetail.html',
    styleUrls: [
        '../Styles/userDetail.scss',
        '../Styles/button.scss',
        '../Styles/toggleButton.scss'
    ]
})

/**
 * Consider rename this component because it's name is conflict with user.component.
 */
export class UserDetailComponent implements OnInit {
    public me: KahlaUser;
    public iconUrl: string;
    public loadingImgURL = Values.loadingImgURL;
    @ViewChild('imageInput') public imageInput;

    constructor(
        private authApiService: AuthApiService,
        private router: Router,
        public uploadService: UploadService,
        public cacheService: CacheService,
        private probeService: ProbeService,
        private meRepo: MeRepo
    ) {
    }

    public async ngOnInit(): Promise<void> {
        // Fast render
        const cachedResponse = await this.meRepo.getMe();
        this.me = cachedResponse.response;
        this.iconUrl = this.probeService.encodeProbeFileUrl(this.me.iconFilePath);

        // Full load
        if (!cachedResponse.isLatest) {
            this.me = (await this.meRepo.getMe(false)).response;
            this.iconUrl = this.probeService.encodeProbeFileUrl(this.me.iconFilePath);
        }
    }

    public async uploadAvatar(): Promise<void> {
        if (this.imageInput) {
            const fileBrowser = this.imageInput.nativeElement;
            if (fileBrowser.files && fileBrowser.files[0]) {
                const newIconPath = await this.uploadService.uploadAvatar(fileBrowser.files[0]);
                if (newIconPath) {
                    this.me.iconFilePath = newIconPath;
                }
            }
        }
    }

    public async save(): Promise<void> {
        const saveButton = document.querySelector('#save');
        saveButton.textContent = 'Saving...';
        const response = await this.authApiService.UpdateInfo(this.me.nickName, this.me.bio, this.me.iconFilePath);
        if (response.code === 0) {
            this.meRepo.overrideCache(this.me);
            this.router.navigate(['/home']);
        } else {
            Swal.fire('Error', (response as AiurProtocal as AiurCollection<string>).items.join('<br/>'), 'error');
        }
        saveButton.textContent = 'Save';
    }
}
