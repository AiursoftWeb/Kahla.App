import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
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
// Modules
import { AppRoutingModule } from './Modules/AppRoutingModule';
// Services
import { ApiService } from './Services/ApiService';
import { ParamService } from './Services/ParamService';
import { JsonpModule } from '@angular/http';
import { Notify } from './Services/Notify';
import { CacheService } from './Services/CacheService';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        JsonpModule
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
        UserComponent
    ],
    providers: [
        ApiService,
        Notify,
        ParamService,
        CacheService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

 // platformBrowserDynamic().bootstrapModule(AppModule);
