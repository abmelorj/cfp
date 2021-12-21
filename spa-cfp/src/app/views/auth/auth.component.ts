import { Component, OnInit } from '@angular/core';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(
    private cfpService: CFPService
  ) { }

  ngOnInit(): void {
    this.cfpService.moduleName = 'Controle Financeiro'
  }

}
