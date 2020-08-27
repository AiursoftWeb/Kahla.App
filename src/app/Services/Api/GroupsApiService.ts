import { ApiService } from './ApiService';
import { Injectable } from '@angular/core';
import { AiurValue } from '../../Models/AiurValue';
import { AiurProtocal } from '../../Models/AiurProtocal';
import { GroupsResult } from '../../Models/GroupsResults';

@Injectable()
export class GroupsApiService {
    private static serverPath = '/groups';

    constructor(
        private apiService: ApiService
    ) {
    }

    public CreateGroup(groupName: string, password: string) {
        return this.apiService.Post<AiurValue<number>>(GroupsApiService.serverPath + '/CreateGroupConversation',
            {
                GroupName: groupName,
                JoinPassword: password
            });
    }

    public JoinGroup(groupName: string, password: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/JoinGroup',
        {
            GroupName: groupName,
            JoinPassword: password
        });
    }

    public LeaveGroup(groupName: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/LeaveGroup', {GroupName: groupName});
    }

    public MuteGroup(groupName: string, setMuted: boolean) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/SetGroupMuted', {
            groupName: groupName,
            setMuted: setMuted
        });
    }

    public TransferOwner(groupName: string, targetUserId: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/TransferGroupOwner', {
            groupName: groupName,
            targetUserId: targetUserId
        });
    }

    public UpdateGroupInfo(groupName: string, listInSearchResult: boolean,
                           avatarPath?: string, newName?: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/UpdateGroupInfo', {
            GroupName: groupName,
            AvatarPath: avatarPath,
            NewName: newName,
            ListInSearchResult: listInSearchResult,
        });
    }

    public UpdateGroupPassword(groupName: string, newJoinPassword?: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/UpdateGroupPassword', {
            GroupName: groupName,
            NewJoinPassword: newJoinPassword
        });
    }

    public KickMember(groupName: string, targetUserId: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/KickMember', {
            groupName: groupName,
            targetUserId: targetUserId
        });
    }

    public DissolveGroup(groupName: string) {
        return this.apiService.Post<AiurProtocal>(GroupsApiService.serverPath + '/DissolveGroup', {
            groupName: groupName
        });
    }

    public GroupSummary(id: number) {
        return this.apiService.Post<AiurValue<GroupsResult>>(GroupsApiService.serverPath + '/GroupSummary', {
            id: id
        });
    }
}
