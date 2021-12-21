import { User } from 'src/app/models/user.interface';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { AccessGrantService } from './../../../services/access-grant.service';
import { AccessGrant } from './../../../models/access-grant.interface';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-access-grant-open',
  templateUrl: './access-grant-open.component.html',
  styleUrls: ['./access-grant-open.component.css']
})
export class AccessGrantOpenComponent implements OnInit {

  accessGrants: AccessGrant[] = []
  tabColumns: string[] = ['owner', 'rule', 'start', 'action']

  constructor(
    private router: Router,
    public cfpService: CFPService,
    private accessGrantService: AccessGrantService
  ) {
    this.updateAccessList()
  }

  ngOnInit(): void {
    this.cfpService.moduleName = 'Acessar controle financeiro'
  }

  selectCFP(owner: User) {
    this.cfpService.setOwner(owner)
    this.router.navigate(['category'])
  }

  updateAccessList() {
    // Carrega os acessos vigentes
    this.accessGrantService
      .listAccessGrantedByUserId(this.cfpService.user.id || 0)
      .subscribe(accessGrantsArray => {
        this.accessGrants = accessGrantsArray
      }
        , err => this.cfpService.showMessage(err));
  }

}
