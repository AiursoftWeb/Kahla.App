import { ApiService } from './ApiService';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { AiurValue } from '../../Models/AiurValue';
import { AiurProtocol } from '../../Models/AiurProtocal';
import { GroupsResult } from '../../Models/GroupsResults';

@Injectable()
export class GroupsApiService {
    private static serverPath = '/groups';

    constructor(
        private apiService: ApiService
    ) {
    }

    public CreateGroup(groupName: string, password: string): Observable<AiurValue<number>> {
        return this.apiService.Post(GroupsApiService.serverPath + '/CreateGroupConversation',
            {
                GroupName: groupName,
                JoinPassword: password
            });
    }

    public JoinGroup(groupName: string, password: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/JoinGroup',
        {
            GroupName: groupName,
            JoinPassword: password
        });
    }

    public LeaveGroup(groupName: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/LeaveGroup', {GroupName: groupName});
    }

    public MuteGroup(groupName: string, setMuted: boolean): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/SetGroupMuted', {
            groupName: groupName,
            setMuted: setMuted
        });
    }

    public TransferOwner(groupName: string, targetUserId: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/TransferGroupOwner', {
            groupName: groupName,
            targetUserId: targetUserId
        });
    }

    public UpdateGroupInfo(groupName: string, listInSearchResult: boolean,
                           avatarPath?: string, newName?: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/UpdateGroupInfo', {
            GroupName: groupName,
            AvatarPath: avatarPath,
            NewName: newName,
            ListInSearchResult: listInSearchResult,
        });
    }

    public UpdateGroupPassword(groupName: string, newJoinPassword?: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/UpdateGroupPassword', {
            GroupName: groupName,
            NewJoinPassword: newJoinPassword
        });
    }

    public KickMember(groupName: string, targetUserId: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/KickMember', {
            groupName: groupName,
            targetUserId: targetUserId
        });
    }

    public DissolveGroup(groupName: string): Observable<AiurProtocol> {
        return this.apiService.Post(GroupsApiService.serverPath + '/DissolveGroup', {
            groupName: groupName
        });
    }

    public GroupSummary(id: number): Observable<AiurValue<GroupsResult>> {
        return this.apiService.Post(GroupsApiService.serverPath + '/GroupSummary', {
            id: id
        });
    }
}
