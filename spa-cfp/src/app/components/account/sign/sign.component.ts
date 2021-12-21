import { Component, OnInit } from '@angular/core';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit(): void {
  }

  onSubmit() { }

}
