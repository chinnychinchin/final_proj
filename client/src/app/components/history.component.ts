import { Component, OnInit, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router, RouterEvent } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  articles

  constructor(private authSvc: AuthService, private router: Router) { }

  ngOnInit(): void {

    this.authSvc.getArticlesHistory().then(result => {this.articles = result}).catch(err => {console.log(err)})
    
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
  //   //Add '${implements OnChanges}' to the class.
  //   this.authSvc.getArticlesHistory().then(result => {console.log(result); this.articles = result}).catch(err => {console.log(err)})

  // }

  async onDelete(id) {

    await this.authSvc.deleteArticle(id);
    const result = await this.authSvc.getArticlesHistory();
    console.log(`${id} deleted`)
    this.articles = result;
  }

}
