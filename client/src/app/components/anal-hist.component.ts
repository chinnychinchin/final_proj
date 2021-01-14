import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-anal-hist',
  templateUrl: './anal-hist.component.html',
  styleUrls: ['./anal-hist.component.css']
})
export class AnalHistComponent implements OnInit {

  constructor(private authSvc: AuthService, private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params.id;
    this.authSvc.getAnalysisHistory(id)
      .then(analysis => {console.log(analysis)})
      .catch(err => {console.log(err); if(err.status == 403){this.router.navigate(['/'])}});
  }

}
