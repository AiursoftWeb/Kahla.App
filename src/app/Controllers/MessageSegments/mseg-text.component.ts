import { Component, input } from "@angular/core";
import { MessageSegmentText } from "../../Models/Messages/MessageSegments";

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-text.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentTextComponent {
    context = input.required<MessageSegmentText>();
}