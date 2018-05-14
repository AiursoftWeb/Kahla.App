import { ContactInfo } from './ContactInfo';
import { Request } from './Request';

export class CacheModel {
    public conversations: ContactInfo[];
    public friendList: ContactInfo[];
    public requests: Request[];
}
