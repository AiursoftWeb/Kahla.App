import { Component, OnInit } from "@angular/core";
import { ApiService } from "../Services/Api/ApiService";
import { InitService } from "../Services/InitService";
import Swal from "sweetalert2";
import { HttpClient } from "@angular/common/http";
import { ServerListApiService } from "../Services/Api/ServerListApiService";

@Component({
    templateUrl: "../Views/signin.html",
    styleUrls: ["../Styles/signin.scss", "../Styles/button.scss"],
})
export class SignInComponent implements OnInit {
    public userName: string = "";
    public password: string = "";


    constructor(
        public apiService: ApiService,
        public serverListApiService: ServerListApiService,
        public initService: InitService,
        public http: HttpClient
    ) {}

    ngOnInit(): void {
    }

    login() {
        Swal.fire("Your login credential is", `Username: ${this.userName} Password: ${this.password}`, "success");
    }

    register() {
        
    }

    forgetPassword() {
        Swal.fire("Forget Password", "Please contact your administrator", "info");
    }

}
