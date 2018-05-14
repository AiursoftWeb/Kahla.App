import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ParamService {
    public param(obj: any): string {
        let urlparam = new HttpParams();
        for (const prop in obj) {
            if (true) {
                urlparam = urlparam.set(prop, obj[prop].toString());
            }
        }
        console.log(urlparam.toString());
        return urlparam.toString();
    }
}
