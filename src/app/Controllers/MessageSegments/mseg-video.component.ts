import { Component, input } from "@angular/core";
import { MessageSegmentVideo } from "../../Models/Messages/MessageSegments";

@Component({
    selector: 'app-mseg-video',
    templateUrl: '../../Views/MessageSegments/mseg-video.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentVideoComponent {
    context = input.required<MessageSegmentVideo>();
}