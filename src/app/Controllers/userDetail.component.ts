import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../Services/ApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AppComponent } from './app.component';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
import Swal from 'sweetalert2';
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
  @ViewChild('imageInput') public imageInput;
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  public ngOnInit(): void {
    if (!AppComponent.me) {
      this.apiService.Me().subscribe(p => {
        this.user = p.value;
      });
    } else {
      this.user = Object.assign({}, AppComponent.me);
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
          this.apiService.UploadFile(formData).subscribe(response => {
            if (Number(response)) {
              this.progress = response;
            } else if (response != null) {
              this.progress = 0;
              this.user.headImgUrl = response;
              this.uploading = false;
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
    this.apiService.UpdateInfo(this.user.nickName, this.user.bio ? this.user.bio : ``, this.user.headImgUrl)
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
