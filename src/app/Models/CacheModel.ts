import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { Device } from './Device';
import { SearchResult } from './SearchResult';
import { KahlaUser } from './KahlaUser';
import { Conversation } from './Conversation';

export class CacheModel {
    public static readonly VERSION = 3;
    public version = CacheModel.VERSION;
    public me: KahlaUser;
    public conversations: ContactInfo[];
    public friends: SearchResult;
    public requests: Request[];
    public devices: Device[];
    public conversationDetail: Map<number, Conversation> = new Map<number, Conversation>();
}
