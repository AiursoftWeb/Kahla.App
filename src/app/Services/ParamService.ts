import { URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ParamService {
    public param(obj: any): string {
        const urlSearchParams = new URLSearchParams();
        for (const prop in obj) {
            if (true) {
                urlSearchParams.append(prop, obj[prop].toString());
            }
        }
        return urlSearchParams.toString();
    }
}
