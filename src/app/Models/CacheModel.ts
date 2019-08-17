import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { Device } from './Device';
import { SearchResult } from './SearchResult';
import { Message } from './Message';
import { KahlaUser } from './KahlaUser';

export class CacheModel {
    public me: KahlaUser;
    public conversations: ContactInfo[];
    public friends: SearchResult;
    public requests: Request[];
    public devices: Device[];
}
