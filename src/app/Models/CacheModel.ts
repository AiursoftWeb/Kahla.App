import { ContactInfo } from './ContactInfo';
import { Request } from './Request';
import { ApiService } from '../Services/ApiService';
import { AppComponent } from '../Controllers/app.component';
import { OnInit } from '@angular/core';

export class CacheModel {
    public conversations: ContactInfo[];
    public friendList: ContactInfo[];
    public requests: Request[];
}
