import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { CacheService } from '../Services/CacheService';
import { Location } from '@angular/common';
import { Values } from '../values';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
@Component({
  templateUrl: '../Views/userDetail.html',
  styleUrls: [
    '../Styles/userDetail.css',
    '../Styles/menu.css'
  ]
})

export class UserDetailComponent implements OnInit {
  public user: KahlaUser;
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    this.apiService.Me().subscribe((t) => {
      this.user = t.value;
    });
  }
  public save() {
    this.apiService.UpdateInfo(this.user.nickName, this.user.bio).subscribe((t) => {
      if (t.code === 0) {
        this.router.navigate(['/kahla/settings']);
      } else if ( t.code === -10 ) {
        swal( t.message, (t as AiurProtocal as AiurCollection<string>).items[0], 'error' );
      } else {
        swal('input in failed', t.message, 'error');
      }
    });
  }
}
