import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { Observable } from 'rxjs/';
import { AiurCollection } from '../../Models/AiurCollection';
import { Message } from '../../Models/Message';
import { AiurProtocol } from '../../Models/AiurProtocal';
import { AiurValue } from '../../Models/AiurValue';
import { Conversation } from '../../Models/Conversation';
import { ContactInfo } from '../../Models/ContactInfo';
import { FileHistoryApiModel } from '../../Models/ApiModels/FileHistoryApiModel';

@Injectable()
export class ConversationApiService {
    private static serverPath = '/conversation';

    constructor(
        private apiService: ApiService
    ) {
    }

    public All(): Observable<AiurCollection<ContactInfo>> {
        return this.apiService.Get(ConversationApiService.serverPath + '/All');
    }

    public GetMessage(id: number, skipFrom: string, take: number): Observable<AiurCollection<Message>> {
        if (skipFrom) {
            return this.apiService.Get(ConversationApiService.serverPath + `/GetMessage?id=${id}&skipFrom=${skipFrom}&take=${take}`);
        } else {
            return this.apiService.Get(ConversationApiService.serverPath + `/GetMessage?id=${id}&take=${take}`);
        }
    }

    public SendMessage(conversationID: number, content: string, messageId: string, userIDs: Array<string>): Observable<AiurValue<Message>> {
        const form = {
            Content: content,
            MessageId: messageId,
        };
        if (userIDs) {
            userIDs.forEach((id, index) => {
                form[`At[${index}]`] = id;
            });
        }
        return this.apiService.Post(ConversationApiService.serverPath + `/SendMessage/${conversationID}`, form);
    }

    public ConversationDetail(id: number): Observable<AiurValue<Conversation>> {
        return this.apiService.Get(ConversationApiService.serverPath + `/ConversationDetail/${id}`);
    }

    public UpdateMessageLifeTime(id: number, newLifeTime: number): Observable<AiurProtocol> {
        return this.apiService.Post(ConversationApiService.serverPath + `/UpdateMessageLifeTime/`, {
            Id: id,
            NewLifeTime: newLifeTime
        });
    }

    public FileHistory(id: number, skipDates: number): Observable<FileHistoryApiModel> {
        return this.apiService.Get(ConversationApiService.serverPath + `/FileHistory/${id}?skipDates=${skipDates}`);
    }
}
