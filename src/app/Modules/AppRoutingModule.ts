import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationsComponent } from '../Controllers/conversations.component';
import { FriendsComponent } from '../Controllers/friends.component';
import { AddFriendComponent } from '../Controllers/add-friend.component';
import { SettingsComponent } from '../Controllers/settings.component';
import { FriendRequestsComponent } from '../Controllers/friendrequests.component';
import { TalkingComponent } from '../Controllers/talking.component';
import { DiscoverComponent } from '../Controllers/discover.component';
import { SignInComponent } from '../Controllers/signin.component';
import { RegisterComponent } from '../Controllers/register.component';
import { UserComponent } from '../Controllers/user.component';
import { AboutComponent } from '../Controllers/about.component';
import { UserDetailComponent } from '../Controllers/userDetail.component';

const routes: Routes = [
    { path: '', redirectTo: '/kahla/signin', pathMatch: 'full' },
    { path: 'kahla/conversations', component: ConversationsComponent },
    { path: 'kahla/friends', component: FriendsComponent },
    { path: 'kahla/addfriend', component: AddFriendComponent },
    { path: 'kahla/discover', component: DiscoverComponent },
    { path: 'kahla/settings', component: SettingsComponent },
    { path: 'kahla/friendrequests', component: FriendRequestsComponent },
    { path: 'kahla/talking/:id', component: TalkingComponent },
    { path: 'kahla/user/:id', component: UserComponent },
    { path: 'kahla/signin', component: SignInComponent },
    { path: 'kahla/register', component: RegisterComponent },
    { path: 'kahla/about', component: AboutComponent },
    { path: 'kahla/userInforDet', component: UserDetailComponent },
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
