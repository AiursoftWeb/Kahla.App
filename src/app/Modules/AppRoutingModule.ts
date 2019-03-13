import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsComponent } from '../Controllers/conversations.component';
import { FriendsComponent } from '../Controllers/friends.component';
import { AddFriendComponent } from '../Controllers/add-friend.component';
import { SettingsComponent } from '../Controllers/settings.component';
import { FriendRequestsComponent } from '../Controllers/friendrequests.component';
import { TalkingComponent } from '../Controllers/talking.component';
import { SignInComponent } from '../Controllers/signin.component';
import { RegisterComponent } from '../Controllers/register.component';
import { UserComponent } from '../Controllers/user.component';
import { AboutComponent } from '../Controllers/about.component';
import { UserDetailComponent } from '../Controllers/userDetail.component';
import { JoinGroupComponent } from '../Controllers/join-group.component';
import { GroupComponent } from '../Controllers/group.component';
import { ChangePasswordComponent } from '../Controllers/changePassword.component';
import { DiscoverComponent } from '../Controllers/discover.component';
import { DevicesComponent } from '../Controllers/devices.component';
import { ThemeComponent } from '../Controllers/theme.component';

const routes: Routes = [
    { path: '', redirectTo: '/conversations', pathMatch: 'full' },
    { path: 'conversations', component: ConversationsComponent },
    { path: 'friends', component: FriendsComponent },
    { path: 'addfriend', component: AddFriendComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'friendrequests', component: FriendRequestsComponent },
    { path: 'talking/:id', component: TalkingComponent },
    { path: 'talking/:id/:unread', component: TalkingComponent },
    { path: 'user/:id', component: UserComponent },
    { path: 'signin', component: SignInComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'about', component: AboutComponent },
    { path: 'userInfo', component: UserDetailComponent },
    { path: 'join-group', component: JoinGroupComponent },
    { path: 'group/:id', component: GroupComponent },
    { path: 'changepassword', component: ChangePasswordComponent },
    { path: 'discover', component: DiscoverComponent },
    { path: 'devices', component: DevicesComponent },
    { path: 'theme' , component: ThemeComponent},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
