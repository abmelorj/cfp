import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CFPService } from 'src/app/services/cfp.service';
import { AccessRuleService } from 'src/app/services/access-rule.service';
import { AccessRule } from 'src/app/models/access-rule.interface';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.interface';
import { AccessGrantService } from 'src/app/services/access-grant.service';
import { AccessGrant } from 'src/app/models/access-grant.interface';

@Component({
  selector: 'app-access-grant-create',
  templateUrl: './access-grant-create.component.html',
  styleUrls: ['./access-grant-create.component.css']
})
export class AccessGrantCreateComponent {

  accessGrant: AccessGrant
  user: User = { email: '' }
  accessRules: AccessRule[] = []

  constructor(
    private router: Router,
    private cfpService: CFPService,
    private userService: UserService,
    private accessGrantService: AccessGrantService,
    private accessRuleService: AccessRuleService
  ) {
    this.accessGrant = {
      agOwnerId: cfpService.owner.id || 0,
      agGrantedUserId: 0,
      agAccessRuleId: 0
    }
    // Carrega lista de perfis de acesso
    accessRuleService.listAccessRules()
      .subscribe((accessRuleArray) => {
        this.accessRules = accessRuleArray
        // Remove o perfil 'Proprietário', pois não é possível conceder este acesso
        this.accessRules.splice(0, 1)
      }
        , err => this.cfpService.showMessage(err))
  }

  async grantAccess() {
    await this.accessGrantService
      .grantAccess(this.user.id || 0, this.user.email, this.accessGrant.agAccessRuleId)
      .then(result => {
        if (result) this.router.navigate(['access-grant'])
      }
        , err => { if (!err) return; })
  }

}