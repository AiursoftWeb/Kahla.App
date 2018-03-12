import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { AiurValue } from '../Models/AiurValue';
import { AiurCollection } from '../Models/AiurCollection';
import { KahlaUser } from '../Models/KahlaUser';
import { Request } from '../Models/Request';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { of } from 'rxjs/observable/of';
import { AiurProtocal } from '../Models/AiurProtocal';
import { Message } from '../Models/Message';
import { URLSearchParams, RequestOptions } from '@angular/http';
import { ParamService } from './ParamService';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { AppComponent } from '../Controllers/app.component';
import { Values } from '../values';
import { UserDetailViewModel } from '../Models/ApiModels/UserDetailViewModel';
import { GlobalValue } from './GlobalValue';
import { VersionViewModel } from '../Models/VersionViewModel';

@Injectable()
export class ApiService {
    public static serverAddress;
    // private headers = new Headers({
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': 'Bearer 3RjR57im'
    // });

    private _headers(withHeader: boolean): Headers {
        if (withHeader) {
            if (GlobalValue.Credential == null) {
                this.handleError('You are calling an api even when credential is null!');
            }
            return new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer ' + GlobalValue.Credential
            });
        } else {
            return new Headers({
                'Content-Type': 'application/x-www-form-urlencoded'
            });
        }
    }

    constructor(
        private http: Http,
        private paramTool: ParamService) {
    }

    private Get<T>(address: string, withHeader = true): Observable<T> {

        return this.http.get(`${ApiService.serverAddress}${address}`, {
            headers: this._headers(withHeader)
        })
            .map(response => response.json() as T)
            .catch(this.handleError);
    }

    private Post<T>(address: string, data: any, withHeader = true): Observable<T> {
        return this.http.post(`${ApiService.serverAddress}${address}`, this.paramTool.param(data), {
            headers: this._headers(withHeader)
        })
            .map(response => response.json() as T)
            .catch(this.handleError);
    }

    public Version(): Observable<VersionViewModel> {
        return this.Get('/Version');
    }

    public AuthByPassword(email: string, password: string): Observable<AiurValue<string>> {
        return this.Post('/AuthByPassword', {
            email: email,
            password: password
        }, false);
    }

    public UploadFile(formData: FormData): Observable<AiurValue<string>> {
        return this.http.post(`${ApiService.serverAddress}/UploadFile`, formData, {
            headers: new Headers({ 'Authorization': 'Bearer ' + GlobalValue.Credential })
        })
            .map(response => response.json() as AiurValue<string>)
            .catch(this.handleError);
    }

    public RegisterKahla(email: string, password: string, confirmPassword: string): Observable<AiurProtocal> {
        return this.Post('/RegisterKahla', {
            email: email,
            password: password,
            confirmPassword: confirmPassword
        }, false);
    }

    public SignInStatus(): Observable<AiurValue<boolean>> {
        if (GlobalValue.Credential != null) {
            return this.Get(`/SignInStatus`);
        }
        const response = new AiurValue<boolean>();
        response.code = 0;
        response.message = 'Response by front-end code.';
        response.value = false;
        return of(response);
    }

    public Me(): Observable<AiurValue<KahlaUser>> {
        return this.Get(`/Me`);
    }

    public MyFriends(orderByName: boolean): Observable<AiurCollection<ContactInfo>> {
        return this.Get(`/MyFriends?orderByName=${orderByName}`);
    }

    public DeleteFriend(id: string): Observable<AiurProtocal> {
        return this.Post(`/DeleteFriend/${id}`, {});
    }

    public CreateRequest(id: string): Observable<AiurValue<number>> {
        return this.Post(`/CreateRequest/${id}`, {});
    }

    public CompleteRequest(id: number, accept: boolean): Observable<AiurProtocal> {
        return this.Post(`/CompleteRequest/${id}`, {
            accept: accept
        });
    }

    public MyRequests(): Observable<AiurCollection<Request>> {
        return this.Get(`/MyRequests`);
    }

    public SearchFriends(nickName: string): Observable<AiurCollection<KahlaUser>> {
        return this.Get(`/SearchFriends/?nickname=${nickName}`);
    }

    public GetMessage(id: number, take: number): Observable<AiurCollection<Message>> {
        return this.Get(`/GetMessage/${id}?take=${take}`);
    }

    public SendMessage(id: number, content: string): Observable<AiurProtocal> {
        return this.Post(`/SendMessage/${id}`, { content: content });
    }

    public UserDetail(id: string): Observable<UserDetailViewModel> {
        return this.Get(`/UserDetail/${id}`);
    }

    public ConversationDetail(id: number): Observable<AiurValue<Conversation>> {
        return this.Get(`/ConversationDetail/${id}`);
    }

    public InitPusher(): Observable<InitPusherViewModel> {
        return this.Get(`/InitPusher`);
    }

    public LogOff(): void {
        GlobalValue.Credential = null;
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
