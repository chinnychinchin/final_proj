import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-anal-hist',
  templateUrl: './anal-hist.component.html',
  styleUrls: ['./anal-hist.component.css']
})
export class AnalHistComponent implements OnInit {
  analysis
  isNotEmpty = {domain: true, title: true, content: true}

  constructor(private authSvc: AuthService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params.id;
    this.authSvc.getAnalysisHistory(id)
      //@ts-ignore
      .then(result => {this.checkIfEmpty(result['analysis']); this.analysis = result.analysis})
      .catch(err => {console.log(err); if(err.status == 403){this.router.navigate(['/'])}});
  }


  checkIfEmpty(analysis){
    this.isNotEmpty.domain = (Object.keys(analysis['domain']).length == 0) ? false : true;
    this.isNotEmpty.title = (Object.keys(analysis['title']).length == 0) ? false : true;
    this.isNotEmpty.content = (Object.keys(analysis['content']).find(x => x.toLowerCase() == 'score') == undefined) ? false : true;
  }

}
