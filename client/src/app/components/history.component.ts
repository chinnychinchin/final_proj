import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  articles

  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {

    this.authSvc.getHistory().then(result => {console.log(result); this.articles = result}).catch(err => {console.log(err)})

  }

}
