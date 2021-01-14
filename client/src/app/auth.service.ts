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
      
        window.open('/auth/google',"mywindow","location=1,status=1,scrollbars=1, width=800,height=800");
        window.addEventListener('message', (message) => {
            //message will contain google user and details
            try{ localStorage.setItem('jwt',message.data.token) }
            catch { this.token = message.data.token }
            if(this.getToken() != ''){
                //console.log(this.token)
                this.router.navigate(['/main'])
            }  
        });
        
    }

    getToken() {

        const token = localStorage.getItem('jwt');
        if(token != null) {return token}
        else{ return this.token }
    }

    isLogin() {

        const token = this.getToken()
        return token != ''
    }

    analyzeArticle(article){

        const headers = new HttpHeaders({"Authorization": this.getToken()});
        return this.http.post("/api/analyze", article, {headers, observe:'response'}).toPromise();

    }


    getArticlesHistory(){

        const headers = new HttpHeaders({"Authorization": this.getToken()});
        return this.http.get("/api/history", {headers}).toPromise()

    }


    getAnalysisHistory(id){
        
        const headers = new HttpHeaders({"Authorization": this.getToken()});
        return this.http.get(`/api/history/${id}`, {headers}).toPromise()

    }

    deleteArticle(id){

        const headers = new HttpHeaders({"Authorization": this.getToken()});
        return this.http.delete(`/api/history/${id}`, {headers}).toPromise();

    }



    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

        if(this.isLogin())
            return true
        return this.router.parseUrl('/') //route to navigate to in the event of an error
    }

}