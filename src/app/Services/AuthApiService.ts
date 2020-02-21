import { Injectable } from '@angular/core';
import { AiurValue } from '../Models/AiurValue';
import { KahlaUser } from '../Models/KahlaUser';
import { Observable } from 'rxjs/';
import { AiurProtocal } from '../Models/AiurProtocal';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { VersionViewModel } from '../Models/VersionViewModel';
import { ApiService } from './ApiService';

@Injectable()
export class AuthApiService {
    private static serverPath = '/auth';

    constructor(
        private apiService: ApiService
    ) {}

    public Version(): Observable<VersionViewModel> {
        return this.apiService.Get(AuthApiService.serverPath + '/Version');
    }

    public SignInStatus(): Observable<AiurValue<boolean>> {
        return this.apiService.Get(AuthApiService.serverPath + '/SignInStatus');
    }

    public Me(): Observable<AiurValue<KahlaUser>> {
        return this.apiService.Get(AuthApiService.serverPath + '/Me');
    }

    public UpdateInfo(nickName: string, bio: string, headIconPath: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/UpdateInfo', {
            nickName: nickName,
            bio: bio,
            headIconPath: headIconPath,
        });
    }

    public UpdateClientSetting(themeId: number = null,
                               enableEmailNotification: boolean = null,
                               enableEnterToSendMessage: boolean = null,
                               enableInvisiable: boolean = null,
                               markEmailPublic: boolean = null): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/UpdateClientSetting', {
            ThemeId: themeId,
            EnableEmailNotification: enableEmailNotification,
            EnableEnterToSendMessage: enableEnterToSendMessage,
            EnableInvisiable: enableInvisiable,
            MarkEmailPublic: markEmailPublic,
        });
    }

    public ChangePassword(oldPassword: string, newPassword: string, repeatPassword: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/ChangePassword', {
            OldPassword: oldPassword,
            NewPassword: newPassword,
            RepeatPassword: repeatPassword
        });
    }

    public InitPusher(): Observable<InitPusherViewModel> {
        return this.apiService.Get(AuthApiService.serverPath + '/InitPusher');
    }

    public LogOff(deviceID: number): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/LogOff', {deviceID: deviceID});
    }

    public SendMail(email: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/SendEmail', {email: email});
    }
}
