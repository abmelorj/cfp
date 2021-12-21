import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CFPService } from 'src/app/services/cfp.service';
import { UserService } from './../../../services/user.service';
import { User } from '../../../models/user.interface';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {

  login = {
    email: '',
    password: ''
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
      this.user.email = this.login.email
      await this.cfpService.digest(this.login.password)
        .then((hash: string) => this.user.hash = hash)
      await this.userService.signin(this.user)
      // navegar para a rota principal
      this.router.navigate(['category'])
    } catch (error: any) {
      this.cfpService.showMessage(error.toString());
    }
  }
}
