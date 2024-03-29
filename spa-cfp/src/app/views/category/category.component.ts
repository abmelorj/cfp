import { Value } from './../../models/value.interface';
import { Balance } from './../../models/balance.interface';
import { Observable } from 'rxjs';
import { CFPService } from 'src/app/services/cfp.service';
import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';
import { Component, Input, OnInit, AfterContentChecked, DoCheck, AfterContentInit, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit, AfterContentChecked, DoCheck, AfterContentInit, AfterViewInit, OnDestroy {

  @Input() categories: Category[] = [];
  @Input() reservs: Category[] = [];
  @Input() funds: Category[] = [];

  public categoryTabIndex?: number;

  // Totalizadores Reserva Financeira
  private reservBalance: number = 0;
  private reservBalanceByMonth: number = 0;
  private reservPendingValue: number = 0;
  private reservPendingValueByMonth: number = 0;

  // Totalizadores Recurso Financeiro
  private fundBalance: number = 0;
  private fundBalanceByMonth: number = 0;
  private fundPendingValue: number = 0;
  private fundPendingValueByMonth: number = 0;

  constructor(
    private categoryService: CategoryService,
    private cfpService: CFPService
  ) {
    // Armazena a referência do componente CategoryComponent no service para:
    // - setar o tabIndex da aba de categorias a partir do menu no HomeComponent;
    // - atualizar lista de categorias e saldos quando alterar o mês selecionado no MonthComponent.
    cfpService.categoryComponent = this;
  }

  ngOnInit(): void {
    this.cfpService.moduleName = 'Categoria'
    // Seleciona a aba que estava aberta, se for o caso
    if (this.categoryTabIndex === undefined && this.cfpService) {
      this.categoryTabIndex = this.cfpService.getCategoryTabIndex();
    }
    // Recupera a lista de categorias do controle financeiro
    this.loadCategories();
  }

  loadCategories() {
    return new Promise(async (resolve) => {
      Promise.all([this.categoryService.findCategoriesByOwnerId().toPromise()])
        .then(categoryArrayApi => {
          this.categories = categoryArrayApi[0];
          this.updateCategoryArray();
        });
      resolve(true);
    });
  }

  ngAfterContentChecked(): void {
    if (this.categoryTabIndex !== undefined)
      this.cfpService.setCategoryTabIndexCFPonly(this.categoryTabIndex);
  }

  updateCategoryArray(): void {
    // A lista de categorias foi carregada?
    if (this.categories) {
      // Distribui a lista de categorias entre Reserva e Recurso
      this.reservs = [];
      this.funds = [];
      this.categories.forEach(category => {
        category.balance$ = this.categoryService.getCategoryBalance(category.id || 0);
        category.balanceByMonth$ = this.categoryService.getCategoryBalanceByMonth(category.id || 0);
        category.pendingValue$ = this.categoryService.getCategoryPendingValue(category.id || 0);
        category.pendingValueByMonth$ = this.categoryService.getCategoryPendingValueByMonth(category.id || 0);
        if (category.isActive) {
          if (category.isCredit && !this.categoryService.isCreditCardCategory(category.name)) {
            this.reservs.push(category);
          } else {
            this.funds.push(category)
          }
        }
      });
      this.calulateBalances();
    }
  }

  calulateBalances() {
    // Calcula os saldos...
    return new Promise(async (resolve) => {
      // Arrays auxiliares usados para calcular os saldos no mês e final por tipo de categoria
      let balancePromises: Promise<Balance>[] = [];
      let pendingValuePromises: Promise<Value>[] = [];

      /************************************
       *  BALANCE
       * */
      // Saldo no Mês de Reserva Financeira
      balancePromises = this.reservs
        .filter(category => category !== null && category.isActive && category.balanceByMonth$ !== null)
        .map(async category => (category.balanceByMonth$ || new Observable<Balance>()).toPromise());
      this.reservBalanceByMonth = await Promise.all(balancePromises)
        .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));

      // Saldo Final de Reserva Financeira
      balancePromises = this.reservs
        .filter(category => category !== null && category.isActive && category.balance$ !== null)
        .map(async category => (category.balance$ || new Observable<Balance>()).toPromise());
      this.reservBalance = await Promise.all(balancePromises)
        .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));

      // Saldo no Mês de Recurso Financeiro
      balancePromises = this.funds
        .filter(category => category !== null && category.isActive && category.balanceByMonth$ !== null)
        .map(async category => (category.balanceByMonth$ || new Observable<Balance>()).toPromise());
      this.fundBalanceByMonth = await Promise.all(balancePromises)
        .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));

      // Saldo Final de Recurso Financeiro
      balancePromises = this.funds
        .filter(category => category !== null && category.isActive && category.balance$ !== null)
        .map(async category => (category.balance$ || new Observable<Balance>()).toPromise());
      this.fundBalance = await Promise.all(balancePromises)
        .then(balances => balances.reduce((total, balance) => total + (balance !== null ? balance.value : 0), 0));

      /************************************
       *  PENDING VALUE
       * */
      // Saldo no Mês de Reserva Financeira
      pendingValuePromises = this.reservs
        .filter(category => category !== null && category.isActive && category.pendingValueByMonth$ !== null)
        .map(async category => (category.pendingValueByMonth$ || new Observable<Value>()).toPromise());
      this.reservPendingValueByMonth = await Promise.all(pendingValuePromises)
        .then(pendingValues => pendingValues.reduce((total, pendingValue) => total + (pendingValue !== null ? pendingValue.value : 0), 0));

      // Saldo Final de Reserva Financeira
      pendingValuePromises = this.reservs
        .filter(category => category !== null && category.isActive && category.pendingValue$ !== null)
        .map(async category => (category.pendingValue$ || new Observable<Value>()).toPromise());
      this.reservPendingValue = await Promise.all(pendingValuePromises)
        .then(pendingValues => pendingValues.reduce((total, pendingValue) => total + (pendingValue !== null ? pendingValue.value : 0), 0));

      // Saldo no Mês de Recurso Financeiro
      pendingValuePromises = this.funds
        .filter(category => category !== null && category.isActive && category.pendingValueByMonth$ !== null)
        .map(async category => (category.pendingValueByMonth$ || new Observable<Value>()).toPromise());
      this.fundPendingValueByMonth = await Promise.all(pendingValuePromises)
        .then(pendingValues => pendingValues.reduce((total, pendingValue) => total + (pendingValue !== null ? pendingValue.value : 0), 0));

      // Saldo Final de Recurso Financeiro
      pendingValuePromises = this.funds
        .filter(category => category !== null && category.isActive && category.pendingValue$ !== null)
        .map(async category => (category.pendingValue$ || new Observable<Value>()).toPromise());
      this.fundPendingValue = await Promise.all(pendingValuePromises)
        .then(pendingValues => pendingValues.reduce((total, pendingValue) => total + (pendingValue !== null ? pendingValue.value : 0), 0));

      resolve(true);
    });
  }

  ngDoCheck(): void {
    // Configura os saldos conforme a aba selecionada
    if (this.categoryTabIndex === 0) {
      // Reserva Financeira
      this.cfpService.shallLabel = 'Obrigação pendente';
      this.cfpService.shallValue = this.reservPendingValueByMonth;
      this.cfpService.balanceValue = this.reservBalanceByMonth - this.reservPendingValueByMonth;
      this.cfpService.finalBalanceValue = this.reservBalance - this.reservPendingValue;
    } else {
      // Recurso Financeiro
      this.cfpService.shallLabel = 'Obrigação pendente';
      this.cfpService.shallValue = this.fundPendingValueByMonth;
      this.cfpService.balanceValue = this.fundBalanceByMonth - this.fundPendingValueByMonth;
      this.cfpService.finalBalanceValue = this.fundBalance - this.fundPendingValue;
    }
  }

  ngAfterContentInit(): void { }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    // Reseta referência ao destruir para evitar erro no MonthComponent
    this.cfpService.categoryComponent = undefined;
  }

}
