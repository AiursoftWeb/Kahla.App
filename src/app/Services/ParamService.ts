// import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class ParamService {
    public param(obj: Record<string, unknown>): string {
        let data = ``;
        for (const prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] != null) {
                data += prop + '=' + encodeURIComponent(obj[prop].toString()) + '&';
            }
        }
        return data;
    }
}
