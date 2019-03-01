import { Injectable } from '@angular/core';
import { AiurValue } from '../Models/AiurValue';
import { KahlaUser } from '../Models/KahlaUser';
import { Observable } from 'rxjs/';
import { AiurProtocal } from '../Models/AiurProtocal';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { VersionViewModel } from '../Models/VersionViewModel';
import { ApiService } from './ApiService';
import { AiurCollection } from '../Models/AiurCollection';
import { Device } from '../Models/Device';

@Injectable()
export class AuthApiService {
    private static serverPath = '/auth';

    constructor(
        private apiService: ApiService
    ) {}

    public Version(): Observable<VersionViewModel> {
        return this.apiService.Get(AuthApiService.serverPath + '/Version');
    }

    public AuthByPassword(email: string, password: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/AuthByPassword', {
            email: email,
            password: password
        });
    }

    public RegisterKahla(email: string, password: string, confirmPassword: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/RegisterKahla', {
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    }

    public SignInStatus(): Observable<AiurValue<boolean>> {
        return this.apiService.Get(AuthApiService.serverPath + '/SignInStatus');
    }

    public Me(): Observable<AiurValue<KahlaUser>> {
        return this.apiService.Get(AuthApiService.serverPath + '/Me');
    }

    public UpdateInfo(nickName: string, bio: string, headImgKey: number, hideMyEmail: boolean): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/UpdateInfo', {
            nickName: nickName,
            bio: bio,
            headImgKey: headImgKey,
            hideMyEmail: hideMyEmail
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

    public AddDevice(userAgent: string, PushEndpoint: string, PushP256DH: string, PushAuth: string): Observable<AiurValue<number>> {
        return this.apiService.Post(AuthApiService.serverPath + '/AddDevice', {
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        });
    }

    public UpdateDevice(deviceID: number, userAgent: string, PushEndpoint: string,
        PushP256DH: string, PushAuth: string): Observable<AiurValue<number>> {
        return this.apiService.Post(AuthApiService.serverPath + '/UpdateDevice', {
            DeviceId: deviceID,
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        });
    }

    public MyDevices(): Observable<AiurCollection<Device>> {
        return this.apiService.Get(AuthApiService.serverPath + '/MyDevices');
    }

    public PushTestMessage(): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + '/PushTestMessage', {});
    }
}
