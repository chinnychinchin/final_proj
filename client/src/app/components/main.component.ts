import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  newsArticleForm: FormGroup
  analysis
  isNotEmpty = {domain: true, title: true, content: true}
  canShare = false

  constructor(private fb: FormBuilder, private authSvc: AuthService, private webshare: NgNavigatorShareService, private router: Router) { }

  ngOnInit(): void {

    this.canShare = this.webshare.canShare();
    this.newsArticleForm = this.fb.group({

      url: this.fb.control(''),
      title: this.fb.control(''),
      content: this.fb.control('')

    })

  }

  checkIfEmpty(analysis){
    this.isNotEmpty.domain = (Object.keys(analysis['domain']).length == 0) ? false : true;
    this.isNotEmpty.title = (Object.keys(analysis['title']).length == 0) ? false : true;
    this.isNotEmpty.content = (Object.keys(analysis['content']).find(x => x.toLowerCase() == 'score') == undefined) ? false : true;
  }

  async onAnalyzeClick() {

    const article = this.newsArticleForm.value;
    try{ 
      
      const {body} = await this.authSvc.analyzeArticle(article) 
      this.checkIfEmpty(body);
      this.analysis = body
      console.log(this.analysis)

    } 
    catch(err){ if(err.status == 403){this.router.navigate(['/'])} }
  }

  onResetClick() {
    this.newsArticleForm.reset()
  }

  share() {
    const article = this.newsArticleForm.value;
    console.log(article)
    this.webshare.share({
      title: 'My Article',
      text: `${article['title']}\n\n${article['content']}\n\n${article['url']}\n\n(Analysis by Veracity: \nDomain: ${this.analysis['domain']['category']}, \nTitle: ${this.analysis['title']['score'].toFixed(5)}(${this.analysis['title']['decision']}), \nContent: ${this.analysis['content']['score'].toFixed(5)}(${this.analysis['content']['decision']}))`,

    }).then((resp) => {console.log(resp)}).catch(e => {console.log(e)} )
  }

  getDaysElapsed(date: Date) {
    const now = new Date ();
    const millisecondsElapsed = now.getTime() - date.getTime();
    const daysElapsed = Math.floor(millisecondsElapsed/(1000*60*60*24))
    return daysElapsed
  }

}

