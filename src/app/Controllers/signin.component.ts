import { Component, OnInit } from "@angular/core";
import { ApiService } from "../Services/Api/ApiService";
import { InitService } from "../Services/InitService";
import Swal from "sweetalert2";
import { AuthApiService } from "../Services/Api/AuthApiService";
import { lastValueFrom } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { AiurProtocal } from "../Models/AiurProtocal";

@Component({
    templateUrl: "../Views/signin.html",
    styleUrls: ["../Styles/signin.scss", "../Styles/button.scss"],
})
export class SignInComponent implements OnInit {
    public userName: string = "";
    public password: string = "";
    public inRegister: boolean = false;
    public confirmPassword: string = "";
    public emailAddr: string = "";

    constructor(
        public apiService: ApiService,
        public initService: InitService,
        public authApiService: AuthApiService
    ) {}

    ngOnInit(): void {}

    async login() {
        try {
            await lastValueFrom(this.authApiService.SignIn(this.userName, this.password));
            this.initService.init();
        } catch (err) {
            if (err instanceof HttpErrorResponse) {
                const error = err.error as AiurProtocal;
                Swal.fire(error.message, "", "error");
            } else {
                Swal.fire("Unknown error", "", "error");
            }
        }
        
    }

    register() {
        if (this.password !== this.confirmPassword) {
            Swal.fire("Password does not match", "", "error");
            return;
        }
        Swal.fire(
            "Your registration information is",
            `Username: ${this.userName} Password: ${this.password} Email: ${this.emailAddr}`,
            "success"
        );
    }

    forgetPassword() {
        Swal.fire(
            "Forget Password",
            "Please contact your administrator",
            "info"
        );
    }
}
