import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CFPService } from 'src/app/services/cfp.service';
import { UserService } from './../../../services/user.service';
import { User } from 'src/app/models/user.interface';
@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  account = {
    name: '',
    email: '',
    password: '',
    retypepass: ''
  }
  private user: User

  constructor(
    private router: Router,
    private cfpService: CFPService,
    private userService: UserService,
  ) {
    this.user = { email: '' }
  }

  async onSubmit() {
    try {
      if (this.account.password != this.account.retypepass) {
        this.cfpService.showMessage('Senhas diferentes, favor tentar novamente.')
        return
      }

      this.user.name = this.account.name
      this.user.email = this.account.email
      await this.cfpService.digest(this.account.password)
        .then((hash: string) => this.user.hash = hash)

      const result = await this.userService.signup(this.user)
      if (result) {
        this.cfpService.showMessage('Cadastro efetuado!')
        // navegar para a rota principal
        this.router.navigate([''])
      } else {
        this.cfpService.showMessage('Tente novamente!')
      }

    } catch (error: any) {
      console.error(error);
      this.cfpService.showMessage(error.toString())
    }
  }

}
