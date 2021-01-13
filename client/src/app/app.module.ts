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
import { HistoryComponent } from './components/history.component';
import { AnalHistComponent } from './components/anal-hist.component';


const ROUTES: Routes = [

  {path: '', component: LoginComponent},
  {path: 'main', component: MainComponent, canActivate: [AuthService]},
  {path: 'history', component: HistoryComponent, canActivate: [AuthService]},
  {path: 'history/:id', component: AnalHistComponent, canActivate: [AuthService]},    
  {path: '**', redirectTo: '/main', pathMatch: 'full'}

]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HistoryComponent,
    AnalHistComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES,  {
      onSameUrlNavigation: 'reload'
    }),
    AngularSvgIconModule.forRoot()
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
