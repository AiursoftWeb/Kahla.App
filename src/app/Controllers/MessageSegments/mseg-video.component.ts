import { Component, input } from '@angular/core';
import { MessageSegmentVideo } from '../../Models/Messages/MessageSegments';
import { HomeService } from '../../Services/HomeService';

@Component({
    selector: 'app-mseg-video',
    templateUrl: '../../Views/MessageSegments/mseg-video.html',
    standalone: false,
})
export class MessageSegmentVideoComponent {
    content = input.required<MessageSegmentVideo>();

    constructor(public homeService: HomeService) {}
}
