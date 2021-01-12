import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

@Injectable()
export class AuthService implements CanActivate {

    constructor(private http: HttpClient, private router: Router) {}
    private token = ''

    signInWithGoogle() {
        //reset token (if any)
        this.token = '';
      
        window.open('http://localhost:3000/auth/google',"mywindow","location=1,status=1,scrollbars=1, width=800,height=800");
        window.addEventListener('message', (message) => {
            //message will contain google user and details
            this.token = message.data.token
            if(this.token != ''){
                console.log(this.token)
                this.router.navigate(['/main'])
            }  
        });
        
    }

    isLogin() {
        return this.token != ''
    }

    analyzeArticle(article){

        const headers = new HttpHeaders({"Authorization": this.token});
        return this.http.post("http://localhost:3000/api/analyze", article, {headers, observe:'response'}).toPromise();

    }


    getHistory(){

        const headers = new HttpHeaders({"Authorization": this.token});
        return this.http.get("http://localhost:3000/api/history", {headers}).toPromise()

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if(this.isLogin())
            return true
        return this.router.parseUrl('/') //route to navigate to in the event of an error
    }

}