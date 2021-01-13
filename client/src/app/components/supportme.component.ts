import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-supportme',
  templateUrl: './supportme.component.html',
  styleUrls: ['./supportme.component.css']
})
export class SupportmeComponent implements OnInit {

  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {
  }



}
