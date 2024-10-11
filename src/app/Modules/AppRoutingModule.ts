import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddFriendComponent } from '../Controllers/add-friend.component';
import { TalkingComponent } from '../Controllers/talking.component';
import { SignInComponent } from '../Controllers/signin.component';
import { UserComponent } from '../Controllers/user.component';
import { AboutComponent } from '../Controllers/about.component';
import { UserDetailComponent } from '../Controllers/userDetail.component';
import { GroupComponent } from '../Controllers/group.component';
import { ChangePasswordComponent } from '../Controllers/changePassword.component';
import { DiscoverComponent } from '../Controllers/discover.component';
import { DevicesComponent } from '../Controllers/devices.component';
import { ThemeComponent } from '../Controllers/theme.component';
import { AdvancedSettingComponent } from '../Controllers/advanced-setting.component';
import { ManageGroupComponent } from '../Controllers/manageGroup.component';
import { HomeComponent } from '../Controllers/home.component';
import { ShareComponent } from '../Controllers/share.component';
import { FileHistoryComponent } from '../Controllers/file-history.component';

const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'addfriend', component: AddFriendComponent},
    {path: 'talking/:id', component: TalkingComponent},
    {path: 'file-history/:id', component: FileHistoryComponent},
    {path: 'talking/:id/:unread', component: TalkingComponent},
    {path: 'user/:id', component: UserComponent},
    {path: 'signin', component: SignInComponent},
    {path: 'about', component: AboutComponent},
    {path: 'userInfo', component: UserDetailComponent},
    {path: 'group/:id', component: GroupComponent},
    {path: 'managegroup/:id', component: ManageGroupComponent},
    {path: 'changepassword', component: ChangePasswordComponent},
    {path: 'discover', component: DiscoverComponent},
    {path: 'devices', component: DevicesComponent},
    {path: 'theme', component: ThemeComponent},
    {path: 'advanced-setting', component: AdvancedSettingComponent},
    {path: 'share-target', component: ShareComponent},
    {path: '**', redirectTo: '/home', pathMatch: 'full'},
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
