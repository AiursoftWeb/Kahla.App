// Modules
import { AppRoutingModule } from './Modules/AppRoutingModule';
import { ServiceWorkerModule } from '@angular/service-worker';
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
import { FriendRequestsComponent } from './Controllers/friendrequests.component';
import { TalkingComponent } from './Controllers/talking.component';
import { DiscoverComponent } from './Controllers/discover.component';
import { SignInComponent } from './Controllers/signin.component';
import { RegisterComponent } from './Controllers/register.component';
import { NavComponent } from './Controllers/nav.component';
import { HeaderComponent } from './Controllers/header.component';
import { UserComponent } from './Controllers/user.component';
import { AboutComponent } from './Controllers/about.component';
import { UserDetailComponent } from './Controllers/userDetail.component';
import { CreateGroupComponent } from './Controllers/create-group.component';
import { JoinGroupComponent } from './Controllers/join-group.component';
import { GroupComponent } from './Controllers/group.component';
// Services
import { ApiService } from './Services/ApiService';
import { ParamService } from './Services/ParamService';
import { Notify } from './Services/Notify';
import { CacheService } from './Services/CacheService';
import { CheckService } from './Services/CheckService';
import { environment } from '../environments/environment';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
    ],
    declarations: [
        AboutComponent,
        AppComponent,
        ConversationsComponent,
        FriendsComponent,
        AddFriendComponent,
        SettingsComponent,
        FriendRequestsComponent,
        TalkingComponent,
        DiscoverComponent,
        SignInComponent,
        RegisterComponent,
        NavComponent,
        HeaderComponent,
        UserComponent,
        UserDetailComponent,
        CreateGroupComponent,
        JoinGroupComponent,
        GroupComponent
    ],
    providers: [
        ApiService,
        Notify,
        ParamService,
        CacheService,
        CheckService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

 // platformBrowserDynamic().bootstrapModule(AppModule);
