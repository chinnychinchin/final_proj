import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthService {

    constructor(private http: HttpClient) {}
    private token = ''

    signInWithGoogle() {
        //reset token (if any)
        this.token = '';
      
        window.open('/auth/google',"mywindow","location=1,status=1,scrollbars=1, width=800,height=800");
        let listener = window.addEventListener('message', (message) => {
            //message will contain google user and details
            //console.log(message.data)
            this.token = message.data.token
            console.log(this.token)
        });
           
    }

    isLogin() {
        return this.token != ''
    }

}