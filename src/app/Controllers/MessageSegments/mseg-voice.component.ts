import { Component, input } from "@angular/core";
import { MessageSegmentVoice } from "../../Models/Messages/MessageSegments";

@Component({
    selector: 'app-mseg-voice',
    templateUrl: '../../Views/MessageSegments/mseg-voice.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentVoiceComponent {
    context = input.required<MessageSegmentVoice>();
}