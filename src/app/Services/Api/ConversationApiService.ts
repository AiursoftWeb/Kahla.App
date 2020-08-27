import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { AiurCollection } from '../../Models/AiurCollection';
import { Message } from '../../Models/Message';
import { AiurProtocal } from '../../Models/AiurProtocal';
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

    public All() {
        return this.apiService.Get<AiurCollection<ContactInfo>>(ConversationApiService.serverPath + '/All');
    }

    public GetMessage(id: number, skipFrom: string, take: number) {
        if (skipFrom) {
            return this.apiService.Get<AiurCollection<Message>>(ConversationApiService.serverPath + `/GetMessage?id=${id}&skipFrom=${skipFrom}&take=${take}`);
        } else {
            return this.apiService.Get<AiurCollection<Message>>(ConversationApiService.serverPath + `/GetMessage?id=${id}&take=${take}`);
        }
    }

    public SendMessage(conversationID: number, content: string, messageId: string, userIDs: Array<string>) {
        const form = {
            Content: content,
            MessageId: messageId,
        };
        if (userIDs) {
            userIDs.forEach((id, index) => {
                form[`At[${index}]`] = id;
            });
        }
        return this.apiService.Post<AiurValue<Message>>(ConversationApiService.serverPath + `/SendMessage/${conversationID}`, form);
    }

    public ConversationDetail(id: number) {
        return this.apiService.Get<AiurValue<Conversation>>(ConversationApiService.serverPath + `/ConversationDetail/${id}`);
    }

    public UpdateMessageLifeTime(id: number, newLifeTime: number)  {
        return this.apiService.Post<AiurProtocal>(ConversationApiService.serverPath + `/UpdateMessageLifeTime/`, {
            Id: id,
            NewLifeTime: newLifeTime
        });
    }

    public FileHistory(id: number, skipDates: number) {
        return this.apiService.Get<FileHistoryApiModel>(ConversationApiService.serverPath + `/FileHistory/${id}?skipDates=${skipDates}`);
    }
}
