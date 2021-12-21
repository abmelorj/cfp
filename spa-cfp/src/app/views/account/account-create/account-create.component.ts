import { CategoryService } from './../../../services/category.service';
import { AccountService } from './../../../services/account.service';
import { Account } from 'src/app/models/account.interface';
import { Component, OnInit } from '@angular/core';
import { CFPService } from 'src/app/services/cfp.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-create',
  templateUrl: './account-create.component.html',
  styleUrls: ['./account-create.component.css']
})
export class AccountCreateComponent implements OnInit {

  account: Account;
  placeHolderText: string;

  constructor(
    private router: Router,
    private cfpService: CFPService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    // Inicializa hint do campo com base na categoria selecionada
    this.placeHolderText = 'Conta de ' + cfpService.category.name;
    // Inicializa registro para inclusão de conta vinculada à categoria selecionada
    this.account = {
      name: '',
      isCredit: cfpService.category.isCredit,
      isCard: categoryService.isCreditCardCategory(cfpService.category.name),
      accCategoryId: cfpService.category.id || 0
    }
  }

  ngOnInit(): void {
  }

  addAccount() {
    // inclui conta
    this.accountService.addAccount(this.account)
      .subscribe(() => {
        this.cfpService.showMessage('Conta incluída!')
        // Navega para a lista de contas da categoria
        this.router.navigate([`/account/list/${this.cfpService.category.id}`])
      },
        err => this.cfpService.showMessage(err));
  }

}
