// Modules
import { AppRoutingModule } from './Modules/AppRoutingModule';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// Component
import { AppComponent } from './Controllers/app.component';
import { ConversationsComponent } from './Controllers/conversations.component';
import { FriendsComponent } from './Controllers/friends.component';
import { AddFriendComponent } from './Controllers/add-friend.component';
import { SettingsComponent } from './Controllers/settings.component';
import { TalkingComponent } from './Controllers/talking.component';
import { DiscoverComponent } from './Controllers/discover.component';
import { SignInComponent } from './Controllers/signin.component';
import { NavComponent } from './Controllers/nav.component';
import { HeaderComponent } from './Controllers/header.component';
import { UserComponent } from './Controllers/user.component';
import { AboutComponent } from './Controllers/about.component';
import { UserDetailComponent } from './Controllers/userDetail.component';
import { GroupComponent } from './Controllers/group.component';
import { ChangePasswordComponent } from './Controllers/changePassword.component';
import { DevicesComponent } from './Controllers/devices.component';
import { ThemeComponent } from './Controllers/theme.component';
import { AdvancedSettingComponent } from './Controllers/advanced-setting.component';
import { ManageGroupComponent } from './Controllers/manageGroup.component';
import { HomeComponent } from './Controllers/home.component';
import { ShareComponent } from './Controllers/share.component';
import { FileHistoryComponent } from './Controllers/file-history.component';
// Services
import { ApiService } from './Services/Api/ApiService';
import { ParamService } from './Services/ParamService';
import { CacheService } from './Services/CacheService';
import { UploadService } from './Services/UploadService';
import { AuthApiService } from './Services/Api/AuthApiService';
import { ConversationApiService } from './Services/Api/ConversationApiService';
import { FilesApiService } from './Services/Api/FilesApiService';
import { FriendsApiService } from './Services/Api/FriendsApiService';
import { GroupsApiService } from './Services/Api/GroupsApiService';
import { MessageService } from './Services/MessageService';
import { InitService } from './Services/InitService';
import { DevicesApiService } from './Services/Api/DevicesApiService';
import { ThemeService } from './Services/ThemeService';
import { HomeService } from './Services/HomeService';
import { FriendshipService } from './Services/FriendshipService';
import { ProbeService } from './Services/ProbeService';
import { VjsPlayerComponent } from './Controllers/vjs-player.component';
import { EventService } from './Services/EventService';
import { GlobalNotifyService } from './Services/GlobalNotifyService';
import { MessagesApiService } from './Services/Api/MessagesApiService';
import { ContactsApiService } from './Services/Api/ContactsApiService';
import { SearchApiService } from './Services/Api/SearchApiService';
import { MyContactsRepository } from './Repositories/MyContactsRepository';
import { ContactListComponent } from './Controllers/contact-list.component';

@NgModule({
    imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule],
    declarations: [
        AboutComponent,
        AppComponent,
        ConversationsComponent,
        FriendsComponent,
        AddFriendComponent,
        SettingsComponent,
        TalkingComponent,
        DiscoverComponent,
        SignInComponent,
        NavComponent,
        HeaderComponent,
        UserComponent,
        UserDetailComponent,
        GroupComponent,
        ChangePasswordComponent,
        DevicesComponent,
        ThemeComponent,
        AdvancedSettingComponent,
        ManageGroupComponent,
        HomeComponent,
        ShareComponent,
        FileHistoryComponent,
        VjsPlayerComponent,
        ContactListComponent
    ],
    providers: [
        ApiService,
        ParamService,
        CacheService,
        UploadService,
        AuthApiService,
        MessagesApiService,
        ConversationApiService,
        FilesApiService,
        FriendsApiService,
        GroupsApiService,
        MessageService,
        InitService,
        DevicesApiService,
        ThemeService,
        HomeService,
        FriendshipService,
        ProbeService,
        EventService,
        GlobalNotifyService,
        ContactsApiService,
        SearchApiService,
        MyContactsRepository,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}

// platformBrowserDynamic().bootstrapModule(AppModule);
