import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { AuthService } from './auth.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';


const ROUTES: Routes = [

  {path: '', component: LoginComponent},
  {path: 'main', component: MainComponent, canActivate: [AuthService]}, 
  {path: '**', redirectTo: '/', pathMatch: 'full'}

]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES),
    AngularSvgIconModule.forRoot()
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
