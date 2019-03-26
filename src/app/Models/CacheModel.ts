import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { Device } from './Device';

export class CacheModel {
    public conversations: ContactInfo[];
    public requests: Request[];
    public devices: Device[];
}
