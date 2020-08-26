import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { AiurCollection } from '../../Models/AiurCollection';
import { AiurProtocal } from '../../Models/AiurProtocal';
import { AiurValue } from '../../Models/AiurValue';
import { Device } from '../../Models/Device';

@Injectable()
export class DevicesApiService {
    private static serverPath = '/devices';

    constructor(
        private apiService: ApiService
    ) {
    }

    public AddDevice(
        userAgent: string,
        PushEndpoint: string,
        PushP256DH: string,
        PushAuth: string) {
        return this.apiService.Post<AiurValue<number>>(DevicesApiService.serverPath + '/AddDevice', {
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        }).toPromise();
    }

    public UpdateDevice(
        deviceID: number,
        userAgent: string,
        PushEndpoint: string,
        PushP256DH: string,
        PushAuth: string) {
        return this.apiService.Post<AiurValue<number>>(DevicesApiService.serverPath + '/UpdateDevice', {
            DeviceId: deviceID,
            Name: userAgent,
            PushEndpoint: PushEndpoint,
            PushP256DH: PushP256DH,
            PushAuth: PushAuth
        }).toPromise();
    }

    public DropDevice(deviceId: number) {
        return this.apiService.Post<AiurProtocal>(DevicesApiService.serverPath + '/DropDevice', {
            id: deviceId
        }).toPromise();
    }

    public MyDevices() {
        return this.apiService.Get<AiurCollection<Device>>(DevicesApiService.serverPath + '/MyDevices').toPromise();
    }

    public PushTestMessage() {
        return this.apiService.Post<AiurProtocal>(DevicesApiService.serverPath + '/PushTestMessage', {}).toPromise();
    }
}
