import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
import Swal from 'sweetalert2';
import { UploadFile } from '../Models/UploadFile';
import { Values } from '../values';
@Component({
  templateUrl: '../Views/userDetail.html',
  styleUrls: [
    '../Styles/userDetail.css',
    '../Styles/menu.css'
  ]
})

export class UserDetailComponent implements OnInit {
  public user: KahlaUser;
  public progress = 0;
  public uploading = false;
  public avatarURL: string;
  private option = { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: 'numeric' };
  @ViewChild('imageInput') public imageInput;
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    if (!AppComponent.me) {
      this.apiService.Me().subscribe(p => {
        p.value.accountCreateTime = new Date(p.value.accountCreateTime).toLocaleString([], this.option);
        this.user = p.value;
        this.avatarURL = Values.fileAddress + this.user.headImgFileKey;
      });
    } else {
      this.user = Object.assign({}, AppComponent.me);
      this.avatarURL = AppComponent.avatarURL;
    }
  }

  public uploadAvatar(): void {
    if (this.imageInput) {
      const fileBrowser = this.imageInput.nativeElement;
      if (fileBrowser.files && fileBrowser.files[0]) {
        if (this.validImageType(fileBrowser.files[0])) {
          const formData = new FormData();
          formData.append('image', fileBrowser.files[0]);
          this.uploading = true;
          const uploadButton = document.querySelector('#upload');
          uploadButton.textContent = 'Uploading';
          this.apiService.UploadFile(formData).subscribe(response => {
            if (Number(response)) {
              this.progress = <number>response;
            } else if (response != null) {
              this.progress = 0;
              this.user.headImgFileKey = (<UploadFile>response).fileKey;
              this.avatarURL = (<UploadFile>response).path;
              this.uploading = false;
              uploadButton.textContent = 'Upload new avatar';
            }
          });
        } else {
          Swal('Try again', 'Only support .png, .jpg or .bmp file', 'error');
        }
      }
    }
  }

  private validImageType(file: File): boolean {
    const validImageTypes = ['png', 'jpg', 'bmp'];
    for (const validType of validImageTypes) {
      if (file.name.substring(file.name.lastIndexOf('.') + 1) === validType) {
        return true;
      }
    }
    return false;
  }

  public save() {
    document.querySelector('#save').textContent = 'saving';
    this.apiService.UpdateInfo(this.user.nickName, this.user.bio ? this.user.bio : ``, this.user.headImgFileKey)
      .subscribe((t) => {
      if (t.code === 0) {
        AppComponent.me = Object.assign({}, this.user);
        this.router.navigate(['/kahla/settings']);
      } else if (t.code === -10) {
        Swal(t.message, (t as AiurProtocal as AiurCollection<string>).items[0], 'error');
      } else {
        Swal('input in failed', t.message, 'error');
      }
    });
  }
}
