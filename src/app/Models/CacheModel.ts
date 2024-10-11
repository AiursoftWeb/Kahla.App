import { ThreadInfo } from './ThreadInfo';
import { Request } from './Request';
import { Device } from './Device';
import { KahlaUser } from './KahlaUser';
import { Conversation } from './Conversation';
import { AccessToken } from './AccessToken';
import { AppOptions } from './AppOptions';
import { ContactInfo } from './Contacts/ContactInfo';

export class CacheModel {
    public static readonly VERSION = 4;
    public version = CacheModel.VERSION;
    public me: KahlaUser;
    public options: AppOptions;
    public conversations: ThreadInfo[];
    public contacts: ContactInfo[];
    public requests: Request[];
    public devices: Device[];
    public conversationDetail: Map<number, Conversation> = new Map<number, Conversation>();
    public probeTokens: Map<number, AccessToken> = new Map<number, AccessToken>();
}
