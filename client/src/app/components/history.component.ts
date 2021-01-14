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

    this.authSvc.getArticlesHistory()
      .then(result => {
        //@ts-ignore
        this.articles = result.map(a => {
          
          const daysElapsed =  this.getDaysElapsed(a.timestamp)
          if(daysElapsed == 0) {a.daysElapsed = "Today"}
          else if(daysElapsed == 1) {a.daysElapsed = "Yesterday"}
          else {a.daysElapsed = `${daysElapsed} days ago`}
          return a
        
        })
        console.log(this.articles)
      }).catch(err => {console.log(err)})
    
  }


  async onDelete(id) {

    await this.authSvc.deleteArticle(id);
    const result = await this.authSvc.getArticlesHistory();
    console.log(`${id} deleted`)
    this.articles = result;
  }

  getDaysElapsed(dateString: string) {
    const now = new Date ();
    const date = new Date(dateString)
    const millisecondsElapsed = now.getTime() - date.getTime();
    const daysElapsed = Math.floor(millisecondsElapsed/(1000*60*60*24))
    return daysElapsed
  }

}
