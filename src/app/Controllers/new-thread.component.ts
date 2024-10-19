import { Component, signal } from "@angular/core";
import { ThreadOptions } from "../Models/Threads/ThreadOptions";

@Component({
    templateUrl: '../Views/new-thread.html',
})
export class NewThreadComponent {
    options = signal<ThreadOptions>({
        name: "Scratch Thread",
        allowDirectJoinWithoutInvitation: false,
        allowMembersEnlistAllMembers: true,
        allowMemberSoftInvitation: true,
        allowMembersSendMessages: true,
        allowSearchByName: false
    });
}