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
  constructor(private fb: FormBuilder, private authSvc: AuthService) { }

  ngOnInit(): void {

    this.newsArticleForm = this.fb.group({

      url: this.fb.control(''),
      title: this.fb.control(''),
      content: this.fb.control('')

    })

  }


  async onAnalyzeClick() {

    const article = this.newsArticleForm.value
    const {body} = await this.authSvc.analyzeArticle(article)
    this.analysis = body
    console.log(this.analysis)

  }

  onResetClick() {
    this.newsArticleForm.reset()
  }

}
