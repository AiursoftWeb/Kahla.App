import { Injectable } from '@angular/core';
import { AiurValue } from '../../Models/AiurValue';
import { KahlaUser } from '../../Models/KahlaUser';
import { AiurProtocal } from '../../Models/AiurProtocal';
import { InitPusherViewModel } from '../../Models/ApiModels/InitPusherViewModel';
import { ApiService } from './ApiService';

@Injectable()
export class AuthApiService {
    private static serverPath = '/auth';

    constructor(
        private apiService: ApiService
    ) {
    }

    public SignInStatus() {
        return this.apiService.Get<AiurValue<boolean>>(AuthApiService.serverPath + '/SignInStatus');
    }

    public Me() {
        return this.apiService.Get<AiurValue<KahlaUser>>(AuthApiService.serverPath + '/Me');
    }

    public UpdateInfo(nickName: string, bio: string, headIconPath: string) {
        return this.apiService.Post<AiurProtocal>(AuthApiService.serverPath + '/UpdateInfo', {
            nickName: nickName,
            bio: bio,
            headIconPath: headIconPath,
        });
    }

    public UpdateClientSetting(themeId: number = null,
                               enableEmailNotification: boolean = null,
                               enableEnterToSendMessage: boolean = null,
                               enableInvisiable: boolean = null,
                               markEmailPublic: boolean = null,
                               listInSearchResult: boolean = null) {
        return this.apiService.Post<AiurProtocal>(AuthApiService.serverPath + '/UpdateClientSetting', {
            ThemeId: themeId,
            EnableEmailNotification: enableEmailNotification,
            EnableEnterToSendMessage: enableEnterToSendMessage,
            EnableInvisiable: enableInvisiable,
            MarkEmailPublic: markEmailPublic,
            ListInSearchResult: listInSearchResult
        });
    }

    public ChangePassword(oldPassword: string, newPassword: string, repeatPassword: string) {
        return this.apiService.Post<AiurProtocal>(AuthApiService.serverPath + '/ChangePassword', {
            OldPassword: oldPassword,
            NewPassword: newPassword,
            RepeatPassword: repeatPassword
        });
    }

    public InitPusher() {
        return this.apiService.Get<InitPusherViewModel>(AuthApiService.serverPath + '/InitPusher');
    }

    public LogOff(deviceID: number) {
        return this.apiService.Post<AiurProtocal>(AuthApiService.serverPath + '/LogOff', {deviceID: deviceID});
    }

    public SendMail(email: string) {
        return this.apiService.Post<AiurProtocal>(AuthApiService.serverPath + '/SendEmail', {email: email});
    }
}
