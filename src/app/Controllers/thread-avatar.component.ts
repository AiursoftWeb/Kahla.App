import { Component, computed, effect, input, Input } from "@angular/core";
import { ThreadInfo } from "../Models/ThreadInfo";

@Component({
    selector: 'app-thread-avatar',
    templateUrl: '../Views/thread-avatar.html'
})
export class ThreadAvatarComponent {
    public thread = input.required<ThreadInfo>();

}