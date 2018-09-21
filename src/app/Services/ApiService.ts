import { Injectable } from '@angular/core';
import { AiurValue } from '../Models/AiurValue';
import { AiurCollection } from '../Models/AiurCollection';
import { KahlaUser } from '../Models/KahlaUser';
import { Request } from '../Models/Request';
import { Observable } from 'rxjs/';
import { map } from 'rxjs/operators';
import { AiurProtocal } from '../Models/AiurProtocal';
import { Message } from '../Models/Message';
import { ParamService } from './ParamService';
import { InitPusherViewModel } from '../Models/ApiModels/InitPusherViewModel';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { UserDetailViewModel } from '../Models/ApiModels/UserDetailViewModel';
import { VersionViewModel } from '../Models/VersionViewModel';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError } from 'rxjs/operators';


@Injectable()
export class ApiService {
    public static serverAddress;

    private _headers: HttpHeaders =
        new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });


    constructor(
        private http: HttpClient,
        private paramTool: ParamService) {
    }

    private Get<T>(address: string): Observable<T> {
        return this.http.get<T>(`${ApiService.serverAddress}${address}`, {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    private Post<T>(address: string, data: any): Observable<T> {
        return this.http.post<T>(`${ApiService.serverAddress}${address}`, this.paramTool.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public Version(): Observable<VersionViewModel> {
        return this.Get('/Version');
    }

    public AuthByPassword(email: string, password: string): Observable<AiurProtocal> {
        return this.Post('/AuthByPassword', {
            email: email,
            password: password
        });
    }

    public UploadFile(formData: FormData): Observable<number | string> {
        const req = new HttpRequest('POST', `${ApiService.serverAddress}/UploadFile`, formData, {
            reportProgress: true,
            withCredentials: true
        });

        return this.http.request(req).pipe(
            map(event => this.getProgress(event)),
            catchError(this.handleError)
        );
    }

    private getProgress(event: HttpEvent<any>): number | string {
        switch (event.type) {
            case HttpEventType.UploadProgress:
                return Math.round(100 * event.loaded / event.total);
            case HttpEventType.Response:
                return event.body.value;
            default:
                return null;
        }
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

    public Me(): Observable<AiurValue<KahlaUser>> {
        return this.Get(`/Me`);
    }

    public UpdateInfo(nickName: string, bio: string, headImgUrl: string): Observable<AiurProtocal> {
        return this.Post('/UpdateInfo', {
            nickName: nickName,
            bio: bio,
            headImgUrl: headImgUrl
        });
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

    public LogOff(): Observable<AiurProtocal> {
        return this.Get(`/LogOff`);
    }

    public CreateGroup(groupName: string): Observable<AiurValue<number>> {
        return this.Post(`/CreateGroupConversation`, { GroupName: groupName });
    }

    public JoinGroup(groupName: string): Observable<AiurProtocal> {
        return this.Post(`/JoinGroup`, {GroupName: groupName});
    }

    public LeaveGroup(groupName: string): Observable<AiurProtocal> {
        return this.Post(`/LeaveGroup`, {GroupName: groupName});
    }

    public SearchGroup(groupName: string): Observable<AiurCollection<Conversation>> {
        return this.Get(`/SearchGroup?GroupName=${groupName}`);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
