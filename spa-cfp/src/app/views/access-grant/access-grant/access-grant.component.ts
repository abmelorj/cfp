import { Component, OnInit } from '@angular/core';
import { AccessGrantService } from './../../../services/access-grant.service';
import { AccessGrant } from './../../../models/access-grant.interface';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-access-grant',
  templateUrl: './access-grant.component.html',
  styleUrls: ['./access-grant.component.css']
})
export class AccessGrantComponent implements OnInit {

  accessGrants: AccessGrant[] = []
  tabColumns: string[] = ['name', 'rule', 'start', 'action']

  constructor(
    private cfpService: CFPService,
    private accessGrantService: AccessGrantService
  ) {
    this.updateAccessList()
  }

  ngOnInit(): void {
    this.cfpService.moduleName = 'Gerenciar acesso'
  }

  revokeAccess(id: number) {
    this.accessGrantService.revokeAccess(id).subscribe({
      next: (accessRevoked: AccessGrant) => {
        this.updateAccessList()
        this.cfpService.showMessage('Acesso revogado!')
      },
      error: (err: any) => {
        this.cfpService.showMessage(err)
      }
    })
  }

  updateAccessList() {
    // Carrega os acessos vigentes
    this.accessGrantService
      .listAccessGrantedByOwnerId(this.cfpService.owner.id || 0)
      .subscribe(accessGrantsArray => {
        this.accessGrants = accessGrantsArray
      }
        , err => this.cfpService.showMessage(err));
  }

}
