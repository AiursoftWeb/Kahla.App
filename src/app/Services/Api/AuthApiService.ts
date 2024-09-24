import { Injectable } from "@angular/core";
import { Observable } from "rxjs/";
import { AiurProtocal } from "../../Models/AiurProtocal";
import { ApiService } from "./ApiService";
import { MeApiModel } from "../../Models/ApiModels/MeApiModel";

@Injectable()
export class AuthApiService {
    private static serverPath = "/auth";

    constructor(private apiService: ApiService) {}

    public Me(): Observable<MeApiModel> {
        return this.apiService.Get(AuthApiService.serverPath + "/Me");
    }

    public UpdateMe(updateModel: {
        nickName?: string;
        bio?: string;
        themeId?: number;
        enableEmailNotification?: boolean;
        enableEnterToSendMessage?: boolean;
        enableHideMyOnlineStatus?: boolean;
        listInSearchResult?: boolean;
    }): Observable<AiurProtocal> {
        return this.apiService.Patch(
            AuthApiService.serverPath + "/update-me",
            updateModel
        );
    }

    public ChangePassword(
        oldPassword: string,
        newPassword: string,
        repeatPassword: string
    ): Observable<AiurProtocal> {
        return this.apiService.Post(
            AuthApiService.serverPath + "/ChangePassword",
            {
                OldPassword: oldPassword,
                NewPassword: newPassword,
                RepeatPassword: repeatPassword,
            }
        );
    }

    public SendMail(email: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + "/SendEmail", {
            email: email,
        });
    }

    public SignIn(email: string, password: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + "/SignIn", {
            Email: email,
            Password: password,
        });
    }

    public Register(email: string, password: string): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + "/Register", {
            Email: email,
            Password: password,
        });
    }

    public Signout(deviceId: number): Observable<AiurProtocal> {
        return this.apiService.Post(AuthApiService.serverPath + "/Signout", {
            DeviceId: deviceId,
        });
    }
}
