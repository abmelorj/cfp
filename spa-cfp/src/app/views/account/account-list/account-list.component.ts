import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CategoryService } from './../../../services/category.service';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from './../../../services/account.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Component, OnInit, AfterContentChecked, Input, DoCheck, OnDestroy } from '@angular/core';
import { Account } from 'src/app/models/account.interface';
import { Balance } from './../../../models/balance.interface';


@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit, AfterContentChecked, DoCheck, OnDestroy {

  @Input() accounts$: Observable<Account[]> = new Observable<Account[]>();
  @Input() categoryName: string = '';
  private categoryId: string;
  private balance: number = 0;
  private balanceByMonth: number = 0;

  constructor(
    private route: ActivatedRoute,
    private cfpService: CFPService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    // Armazena a referência do componente AccountListComponent no service para:
    // - atualizar lista de contas e saldos quando alterar o mês selecionado no MonthComponent.
    cfpService.accountListComponent = this;
    // Captura o Id da categoria informada na rota.
    this.categoryId = route.snapshot.paramMap.get('id') || '0';
    // Recupera categoria pelo Id na rota
    categoryService.getCategoryById(parseInt(this.categoryId))
      .subscribe(category => {
        cfpService.setCategory(category);
        this.categoryName = this.cfpService.category.name;
      }
        , err => cfpService.showMessage(err));

    if (cfpService.getCategoryTabIndex() == 1)
      cfpService.moduleName = 'Recurso Financeiro'
    else
      cfpService.moduleName = 'Reserva Financeira';
  }

  ngOnInit(): void {
    // Recupera a lista de contas da categoria selecionada
    this.loadAccounts();
  }

  ngAfterContentChecked(): void { }

  ngDoCheck(): void {
    this.cfpService.balanceValue = this.balanceByMonth;
    this.cfpService.finalBalanceValue = this.balance;
  }

  ngOnDestroy(): void {
    // Reseta referência ao destruir para evitar erro no MonthComponent
    this.cfpService.accountListComponent = undefined;
  }

  loadAccounts() {
    return new Promise(async (resolve) => {
      // Recupera a lista de contas da categoria selecionada
      this.accounts$ = this.accountService.listAccountsByCategoryId(this.categoryId)
        .pipe(map(accounts$ => accounts$.map(account => {
          account.balance$ = this.accountService.getAccountBalance(account.id || 0);
          account.balanceByMonth$ = this.accountService.getAccountBalanceByMonth(account.id || 0);
          return account;
        })));
      // Calcula os saldos
      this.calculateBalances();
      resolve(true);
    });
  }

  calculateBalances() {
    // Calcula os saldos...
    return new Promise(async (resolve) => {
      await Promise.all([this.accounts$.toPromise()])
        .then(async accounts => {
          // Calcula soma do saldo final das contas...
          let balancePromises = accounts[0]
            .filter(account => account.isActive)
            .map(account => (account.balance$ || new Observable<Balance>()).toPromise());
          this.balance = await Promise.all(balancePromises)
            .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));

          // Calcula soma do saldo no mês das contas...
          balancePromises = accounts[0]
            .filter(account => account.isActive)
            .map(account => (account.balanceByMonth$ || new Observable<Balance>()).toPromise());
          this.balanceByMonth = await Promise.all(balancePromises)
            .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));
        })
      resolve(true);
    })
  }

}
