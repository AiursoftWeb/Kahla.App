import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { AiurCollection } from '../Models/AiurCollection';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurValue } from '../Models/AiurValue';
import { Device } from '../Models/Device';
import { Observable } from 'rxjs/';

@Injectable()
export class DeviesApiService {
    private static serverPath = '/devices';

    constructor(
        private apiService: ApiService
    ) {}

    public AddDevice(userAgent: string, PushEndpoint: string, PushP256DH: string, PushAuth: string): Observable<AiurValue<number>> {
        return this.apiService.Post(DeviesApiService.serverPath + '/AddDevice', {
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        });
    }

    public UpdateDevice(deviceID: number, userAgent: string, PushEndpoint: string,
        PushP256DH: string, PushAuth: string): Observable<AiurValue<number>> {
        return this.apiService.Post(DeviesApiService.serverPath + '/UpdateDevice', {
            DeviceId: deviceID,
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        });
    }

    public MyDevices(): Observable<AiurCollection<Device>> {
        return this.apiService.Get(DeviesApiService.serverPath + '/MyDevices');
    }

    public PushTestMessage(): Observable<AiurProtocal> {
        return this.apiService.Post(DeviesApiService.serverPath + '/PushTestMessage', {});
    }
}
