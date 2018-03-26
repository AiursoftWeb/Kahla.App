import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { ContactInfo } from '../Models/ContactInfo';
import { Conversation } from '../Models/Conversation';
import { CacheService } from '../Services/CacheService';
import { Location } from '@angular/common';
import { Values } from '../values';

@Component({
  templateUrl: '../Views/userDetail.html',
  styleUrls: [
    '../styles/userDetail.css',
    '../styles/menu.css'
  ]
})

export class UserDetailComponent implements OnInit {
  constructor(
    private apiService: ApiService,
  ) { }

public ngOnInit(): void {
}
}
