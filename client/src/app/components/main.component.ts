import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  newsArticleForm: FormGroup
  analysis
  isNotEmpty = {domain: true, title: true, content: true}
  constructor(private fb: FormBuilder, private authSvc: AuthService) { }

  ngOnInit(): void {

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

    const article = this.newsArticleForm.value
    const {body} = await this.authSvc.analyzeArticle(article)
    this.checkIfEmpty(body);
    console.log(this.isNotEmpty)
    this.analysis = body
    console.log(this.analysis)

  }

  onResetClick() {
    this.newsArticleForm.reset()
  }

}
