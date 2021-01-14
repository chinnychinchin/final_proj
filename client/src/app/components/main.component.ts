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
  article
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

    this.article = this.newsArticleForm.value;
    try{ 
      
      const {body} = await this.authSvc.analyzeArticle(this.article) 
      this.checkIfEmpty(body);
      this.analysis = body
    
    } 
    catch(err){ if(err.status == 403){this.router.navigate(['/'])} }
  }

  onResetClick() {
    this.newsArticleForm.reset()
  }

  //function to make the text to be shared
  mkShareTxt(article, analysis) {
    let shareText = ''
    let titleAnal = ''
    let urlAnal = ''
    let contentAnal = ''
    console.log(article.title)
    if(!!article.title.length){
      shareText = shareText + `${article['title']}\n\n`;
      titleAnal = `Title: ${analysis['title']['score'].toFixed(5)}(${analysis['title']['decision']})\n`
    }
    if(!!article.content.length){
      shareText = shareText + `${article['content']}\n\n`
      contentAnal = `Content: ${analysis['content']['score'].toFixed(5)}(${analysis['content']['decision']})`
    }
    if(!!article.url.length){
      shareText = shareText + `${article['url']}\n\n`
      urlAnal = `Domain: ${this.analysis['domain']['category']}\n`
    }
  
    return shareText + `(Analysis by Veracity: \n${urlAnal}${titleAnal}${contentAnal})`
  }

  share() {
    const article = this.newsArticleForm.value;
    const shareText = this.mkShareTxt(article,this.analysis)
    this.webshare.share({
      title: 'My Article',
      text: shareText

    }).then((resp) => {console.log(resp)}).catch(e => {console.log(e)} )
  }

  getDaysElapsed(date: Date) {
    const now = new Date ();
    const millisecondsElapsed = now.getTime() - date.getTime();
    const daysElapsed = Math.floor(millisecondsElapsed/(1000*60*60*24))
    return daysElapsed
  }

}

