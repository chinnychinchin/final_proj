import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FlexLayoutModule } from '@angular/flex-layout'

import { AuthService } from './auth.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login.component';
import { MainComponent } from './components/main.component';
import { HistoryComponent } from './components/history.component';
import { AnalHistComponent } from './components/anal-hist.component';
import { SupportmeComponent } from './components/supportme.component';


const ROUTES: Routes = [

  {path: '', component: LoginComponent},
  {path: 'main', component: MainComponent, canActivate: [AuthService]},
  {path: 'history', component: HistoryComponent, canActivate: [AuthService]},
  {path: 'history/:id', component: AnalHistComponent, canActivate: [AuthService]},
  {path: 'supportme', component: SupportmeComponent, canActivate: [AuthService]},
  {path: '**', redirectTo: '/', pathMatch: 'full'}

]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    HistoryComponent,
    AnalHistComponent,
    SupportmeComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES,  {
      onSameUrlNavigation: 'reload'
    }),
    AngularSvgIconModule.forRoot(),
    FlexLayoutModule
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
