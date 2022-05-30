import { AccountService } from './../../../services/account.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Operation } from 'src/app/models/operation.interface';
import { OperationService } from 'src/app/services/operation.service';

import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, DoCheck, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  styleUrls: ['./operation-list.component.css']
})
export class OperationListComponent implements OnInit, DoCheck, OnDestroy {

  displayedColumns: string[] = ['oprDate', 'description', 'value', 'action'];

  @Input() operations$: Observable<Operation[]> = new Observable<Operation[]>();
  @Input() accountName: string = '';
  @Input() accountId: number;
  private balance: number = 0;
  private balanceByMonth: number = 0;
  private pendingValue: number = 0;
  private pendingValueByMonth: number = 0;

  constructor(
    private accountService: AccountService,
    private cfpService: CFPService,
    private operationService: OperationService,
    private route: ActivatedRoute,
  ) {
    // Armazena a referência do componente OperationListComponent no service para:
    // - atualizar lista de operações e saldos quando alterar o mês selecionado no MonthComponent.
    cfpService.operationListComponent = this;
    // Captura o Id da categoria informada na rota.
    this.accountId = parseInt(route.snapshot.paramMap.get('id') || '0');
    // Recupera categoria pelo Id na rota
    accountService.getAccountById(this.accountId)
      .subscribe(account => {
        cfpService.setAccount(account);
        this.accountName = this.cfpService.account.name;
        this.cfpService.moduleName = this.accountName;
      }
        , err => cfpService.showMessage(err));
  }

  ngOnInit(): void {
    // Recupera a lista de operações da conta selecionada
    this.loadOperations();
  }

  ngDoCheck(): void {
    this.cfpService.shallLabel = 'Obrigação pendente';
    this.cfpService.shallValue = this.pendingValueByMonth;
    this.cfpService.balanceValue = this.balanceByMonth - this.pendingValueByMonth;
    this.cfpService.finalBalanceValue = this.balance - this.pendingValue;
  }

  ngOnDestroy(): void {
    // Reseta referência ao destruir para evitar erro no MonthComponent
    this.cfpService.operationListComponent = undefined;
  }

  loadOperations() {
    return new Promise(async (resolve) => {
      if (this.cfpService.yearMonth > 0) {
        // Recupera a lista de operações da conta selecionada
        this.operations$ = this.operationService.listAccountOperationByMonth(this.accountId.toString());
        // Calcula os saldos
        let balance$ = this.accountService.getAccountBalance(this.accountId);
        let balanceByMonth$ = this.accountService.getAccountBalanceByMonth(this.accountId);
        let pendingValue$ = this.accountService.getAccountPendingValue(this.accountId);
        let pendingValueByMonth$ = this.accountService.getAccountPendingValueByMonth(this.accountId);
        // Prepara array de Promise para executar consulta aos saldos
        let promiseArray = [balance$.toPromise(), balanceByMonth$.toPromise(), pendingValue$.toPromise(), pendingValueByMonth$.toPromise()];
        let valueArray = await Promise.all(promiseArray);
        // Armazena o valor correspondente em cada variável do componente
        this.balance = valueArray[0] ? valueArray[0].value || 0 : 0;
        this.balanceByMonth = valueArray[1] ? valueArray[1].value || 0 : 0;
        this.pendingValue = valueArray[2] ? valueArray[2].value || 0 : 0;
        this.pendingValueByMonth = valueArray[3] ? valueArray[3].value || 0 : 0;
      }

      resolve(true);
    });
  }

  strBrlDateToString(strBrlDate: string) {
    // Recebe: date
    // Retorna: string no formato de data no Brasil
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', year: '2-digit', month: '2-digit', day: '2-digit' }).format(Date.parse(strBrlDate) + 1000 * 60 * 60 * 3)
  }

}
