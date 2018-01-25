﻿import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { AiurValue } from '../Models/AiurValue';
import { AiurCollection } from '../Models/AiurCollection';
import { KahlaUser } from '../Models/KahlaUser';
import { Request } from '../Models/Request';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
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

@Injectable()
export class ApiService {
    public static serverAddress;
    // private headers = new Headers({
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': 'Bearer 3RjR57im'
    // });

    private _headers(): Headers {
        return new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + GlobalValue.Credential
        });
    }

    constructor(
        private http: Http,
        private paramTool: ParamService) {
    }

    private Get<T>(address: string): Observable<T> {
        return this.http.get(`${ApiService.serverAddress}${address}`, {
            headers: this._headers()
        })
            .map(response => response.json() as T)
            .catch(this.handleError);
    }

    private Post<T>(address: string, data: any): Observable<T> {
        return this.http.post(`${ApiService.serverAddress}${address}`, this.paramTool.param(data), {
            headers: this._headers()
        })
            .map(response => response.json() as T)
            .catch(this.handleError);
    }

    public AuthByPassword(email: string, password: string): Observable<AiurValue<string>> {
        return this.Post('/AuthByPassword', {
            email: email,
            password: password
        });
    }

    public UploadFile(formData: FormData): Observable<AiurValue<string>> {
        return this.Post(`/UploadFile`, formData);
    }

    public RegisterKahla(email: string, password: string, confirmPassword: string): Observable<AiurProtocal> {
        return this.Post('/RegisterKahla', {
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });
    }

    public SignInStatus(): Observable<AiurValue<boolean>> {
        return this.Get(`/SignInStatus`);
    }

    public ExchangeServerAddress(): Observable<AiurValue<string>> {
        return this.Get('/ExchangeServerAddress');
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
        return this.Get(`/SearchFriends/?nickname=${nickName}&Credential=${GlobalValue.Credential}`);
    }

    public GetMessage(id: number, take: number): Observable<AiurCollection<Message>> {
        return this.Get(`/GetMessage/${id}?take=${take}&Credential=${GlobalValue.Credential}`);
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
