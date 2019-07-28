import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ShareService {
    public share: boolean;
    public content: string;
}
