import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { Device } from './Device';
import { SearchResult } from './SearchResult';

export class CacheModel {
    public conversations: ContactInfo[];
    public friends: SearchResult;
    public requests: Request[];
    public devices: Device[];
}
