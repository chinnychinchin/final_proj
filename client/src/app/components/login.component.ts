import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AngularSvgIconModule } from 'angular-svg-icon'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private authSvc: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  signIn() {
    this.authSvc.signInWithGoogle()
  }

}
