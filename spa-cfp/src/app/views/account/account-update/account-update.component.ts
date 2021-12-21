import { AccountService } from './../../../services/account.service';
import { CategoryService } from './../../../services/category.service';
import { Component, OnInit } from '@angular/core';
import { Account } from 'src/app/models/account.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { CFPService } from 'src/app/services/cfp.service';

@Component({
  selector: 'app-account-update',
  templateUrl: './account-update.component.html',
  styleUrls: ['./account-update.component.css']
})
export class AccountUpdateComponent implements OnInit {

  account: Account
  oldValue: Account
  placeHolderText: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cfpService: CFPService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    // Inicializa hint do campo com base na categoria selecionada
    this.placeHolderText = 'Conta de ' + cfpService.category.name;
    // Inicializa registro para alteração de conta vinculada à categoria selecionada
    this.account = {
      name: '',
      isCredit: cfpService.category.isCredit,
      isCard: categoryService.isCreditCardCategory(cfpService.category.name),
      accCategoryId: cfpService.category.id || 0
    }
    this.oldValue = this.account;
  }

  ngOnInit(): void {
    // Carrega a conta identificada no path
    const id: number = parseInt(this.route.snapshot.paramMap.get('id') || "0")
    this.accountService.getAccountById(id)
      .subscribe((account: Account) => {
        this.account = account;
        // Tem que criar um novo objeto senão será outra referência para o mesmo objeto em memória
        this.oldValue = { ...account };
      });
  }

  updateAccount(): void {
    // Atualiza conta
    this.accountService.updateAccount(this.account)
      .subscribe({
        next: (account: Account) => {
          this.cfpService.showMessage('Conta atualizada!')
          // Navega para a lista de contas da categoria
          this.router.navigate([`/account/list/${this.cfpService.category.id}`])
        },
        error: (err: any) => this.cfpService.showMessage(err)
      });
  }

  deleteAccount(): void {
    // Exclui conta
    this.accountService.deleteAccount(this.account.id || 0)
      .subscribe({
        next: () => {
          this.cfpService.showMessage('Conta excluída!')
          // Navega para a lista de contas da categoria
          this.router.navigate([`/account/list/${this.cfpService.category.id}`])
        },
        error: (err: any) => this.cfpService.showMessage(err)
      });
  }

  nameChange(name: string) {
    this.account.name = name
    this.isNameChanged = (this.account.name != this.oldValue.name)
  }
  public isNameChanged: boolean = false;
}
