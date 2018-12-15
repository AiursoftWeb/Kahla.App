// import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ParamService {
    public param(obj: any): string {
        let data = ``;
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && obj[prop] != null) {
                data += prop + '=' + encodeURIComponent(obj[prop].toString()) + '&';
            }
        }
        return data;
    }
}
