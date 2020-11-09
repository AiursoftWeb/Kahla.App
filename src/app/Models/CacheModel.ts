// Obsolete. Will be removed.
import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { SearchResult } from './SearchResult';
import { Conversation } from './Conversation';
import { AccessToken } from './AccessToken';

export class CacheModel {
    public static readonly VERSION = 4;
    public version = CacheModel.VERSION;
    public conversations: ContactInfo[];
    public friends: SearchResult;
    public requests: Request[];
    public conversationDetail: Map<number, Conversation> = new Map<number, Conversation>();
    public probeTokens: Map<number, AccessToken> = new Map<number, AccessToken>();
}
