import { Component, input } from "@angular/core";
import { MessageSegmentImage } from "../../Models/Messages/MessageSegments";

@Component({
    selector: 'app-mseg-img',
    templateUrl: '../../Views/MessageSegments/mseg-img.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentImgComponent {
    context = input.required<MessageSegmentImage>();
}