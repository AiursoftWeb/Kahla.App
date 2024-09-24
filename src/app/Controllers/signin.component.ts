import { Component, OnInit } from "@angular/core";
import { ApiService } from "../Services/Api/ApiService";
import { InitService } from "../Services/InitService";
import Swal from "sweetalert2";

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
    ) {}

    ngOnInit(): void {}

    login() {
        Swal.fire(
            "Your login credential is",
            `Username: ${this.userName} Password: ${this.password}`,
            "success"
        );
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
