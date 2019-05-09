import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { Observable } from 'rxjs/';
import { AiurCollection } from '../Models/AiurCollection';
import { Message } from '../Models/Message';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurValue } from '../Models/AiurValue';
import { Conversation } from '../Models/Conversation';

@Injectable()
export class ConversationApiService {
    private static serverPath = '/conversation';

    constructor(
        private apiService: ApiService
    ) {}

    public GetMessage(id: number, skipTill: number, take: number): Observable<AiurCollection<Message>> {
        return this.apiService.Get(ConversationApiService.serverPath + `/GetMessage?id=${id}&skipTill=${skipTill}&take=${take}`);
    }

    public SendMessage(conversationID: number, content: string, userIDs: Array<string>): Observable<AiurProtocal> {
        const form = {content: content};
        userIDs.forEach((id, index) => {
            form[`at[${index}]`] = id;
        });
        return this.apiService.Post(ConversationApiService.serverPath + `/SendMessage/${conversationID}`, form);
    }

    public ConversationDetail(id: number): Observable<AiurValue<Conversation>> {
        return this.apiService.Get(ConversationApiService.serverPath + `/ConversationDetail/${id}`);
    }

    public UpdateMessageLifeTime(id: number, newLifeTime: number): Observable<AiurProtocal> {
        return this.apiService.Post(ConversationApiService.serverPath + `/UpdateMessageLifeTime/`, {
            Id: id,
            NewLifeTime: newLifeTime
        });
    }
}
