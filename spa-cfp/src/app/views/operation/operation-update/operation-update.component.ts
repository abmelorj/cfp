import { BalanceService } from './../../../services/balance.service';
import { AccountService } from 'src/app/services/account.service';
import { OperationTypeService } from './../../../services/operation-type.service';
import { OperationService } from 'src/app/services/operation.service';
import { CategoryService } from 'src/app/services/category.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Operation } from './../../../models/operation.interface';

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OperationType } from 'src/app/models/operation-type.interface';
import { Account } from 'src/app/models/account.interface';
@Component({
  selector: 'app-operation-update',
  templateUrl: './operation-update.component.html',
  styleUrls: ['./operation-update.component.css']
})

export class OperationUpdateComponent implements OnInit, OnDestroy {

  @Input() operationId: number;

  operation: Operation = this.cfpService.operation
  oldOperation: Operation = this.cfpService.operation

  operationTypes: OperationType[] = []
  accounts: Account[] = []
  debitAccounts: Account[] = []
  creditAccounts: Account[] = []
  creditCardAccounts: Account[] = []

  private accountId: number = 0;
  private balanceByMonth: number = 0;
  private pendingValueByMonth: number = 0;
  // private lastTypeId: number = 0;
  // private lastDestinyAccountId: number = 0;


  sourceAccount: Account = { name: '', isCredit: false, isCard: false, accCategoryId: 0 }
  destinyAccount: Account = { name: '', isCredit: false, isCard: false, accCategoryId: 0 }

  constructor(
    private router: Router,
    private cfpService: CFPService,
    private accountService: AccountService,
    private balanceService: BalanceService,
    private operationService: OperationService,
    private operationTypeService: OperationTypeService,
    private route: ActivatedRoute,
  ) {
    // Conta atual onde será registrada a operação
    this.accountId = cfpService.account.id || 0;

    // Captura o Id da operação informada na rota.
    this.operationId = parseInt(route.snapshot.paramMap.get('id') || '0');

    // Recupera operação pelo Id na rota
    operationService.getOperationById(this.operationId)
      .subscribe(operation => {
        this.operation = operation;
        // Inicializa registro para alteração ou exclusão de operação
        cfpService.setOperation(operation);
        this.oldOperation = cfpService.operation;
      }
        , err => cfpService.showMessage(err));

    // Carrega lista de tipos de operação
    operationTypeService.listOperationTypes()
      .subscribe((operationTypeArray) => {
        this.operationTypes = operationTypeArray
          // Manter apenas os tipos de operação válidos de acordo com a conta atual...
          .filter(operationType => {
            if (this.cfpService.account.isCredit && !this.cfpService.account.isCard)
              return [2, 4, 5, 6, 7, 8].includes(operationType.id)
            else
              if (!this.cfpService.account.isCredit && !this.cfpService.account.isCard)
                return [1, 3].includes(operationType.id)
              else
                if (this.cfpService.account.isCredit && this.cfpService.account.isCard)
                  return [5, 7].includes(operationType.id)
                else
                  return false;
          })
          // Ordenar por nome do tipo de operação
          .sort((a, b) => {
            let fa = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let fb = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
          })
      }, err => this.cfpService.showMessage(err));

    // Carrega lista de contas do usuário, que podem ser usadas como conta de destino
    accountService.listAccountsByOwnerId(cfpService.owner.id || 0)
      .subscribe(accountsArray => {
        this.accounts = accountsArray
          .filter(account => account.id != cfpService.account.id)
          // Ordenar por nome do tipo de operação
          .sort((a, b) => {
            let fa = a.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let fb = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (fa < fb) { return -1; }
            if (fa > fb) { return 1; }
            return 0;
          });

        this.debitAccounts = this.accounts
          .filter(account => !account.isCredit)
        this.creditAccounts = this.accounts
          .filter(account => account.isCredit && !account.isCard)
        this.creditCardAccounts = this.accounts
          .filter(account => account.isCredit && account.isCard)

      }, err => this.cfpService.showMessage(err))

  }


  ngOnInit(): void {

  }

  ngDoCheck(): void {

  }

  ngOnDestroy(): void {
    // Reseta label do footer
    this.cfpService.defaultFooter();
  }

  // CONTINUAR AQUI... 30/05/22
  deleteOperation() {
    // Excluir a operação
    this.operationService.deleteOperation(this.operation)
      .subscribe({
        next: () => {
          this.cfpService.showMessage('Operação excluída!')
          // Navega para a lista de operações, selecionando a conta que estava visível
          this.router.navigate([`/operation/list/${this.accountId}`])
        },
        error: (err: any) => this.cfpService.showMessage(err)
      })
  }

  updateOperation() {
    // Preenche a conta atual no como conta de origem ou destino conforme o tipo de operação
    switch (this.operation.oprTypeId) {
      case 1:
      case 2:
        this.operation.oprDestinyAccountId = this.accountId;
        break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        this.operation.oprSourceAccountId = this.accountId;
        break;
      case 8:
        this.operation.oprSourceAccountId = this.accountId;
        this.operation.oprDestinyAccountId = undefined;
        break;
    }

    // Altera a operação, se houver parcela liquidada voltaraá a ficar pendente de pagamento
    this.operationService.updateOperation(this.operation)
      .subscribe(() => {
        this.cfpService.showMessage('Operação alterada!')
        // Navega para a lista de operações, selecionando a conta que estava visível
        this.router.navigate([`/operation/list/${this.accountId}`])
      },
        err => this.cfpService.showMessage(err));
  }

  loadBalances() {
    return new Promise(async (resolve) => {
      if (this.cfpService.yearMonth > 0 && this.operation.oprTypeId) {

        // Calcula saldo disponível no mês na conta de recurso financeiro selecionada como destino
        if ([5, 6, 7].includes(this.operation.oprTypeId) && this.operation.oprDestinyAccountId) {
          // Calcula os saldos
          let balanceByMonth$ = this.accountService.getAccountBalanceByMonth(this.operation.oprDestinyAccountId || 0);
          let pendingValueByMonth$ = this.accountService.getAccountPendingValueByMonth(this.operation.oprDestinyAccountId || 0);
          // Prepara array de Promise para executar consulta aos saldos
          let promiseArray = [balanceByMonth$.toPromise(), pendingValueByMonth$.toPromise()];
          let valueArray = await Promise.all(promiseArray);
          // Armazena o valor correspondente em cada variável do componente
          this.balanceByMonth = valueArray[0] ? valueArray[0].value || 0 : 0;
          this.pendingValueByMonth = valueArray[1] ? valueArray[1].value || 0 : 0;
          // Atualiza saldo do recurso
          if ([6].includes(this.operation.oprTypeId)) {
            this.cfpService.shallLabel = 'Saldo do Cartão no mês';
            this.cfpService.shallValue = this.pendingValueByMonth;
          }
          else {
            this.cfpService.shallLabel = 'Recurso disponível';
            this.cfpService.shallValue = this.balanceByMonth - this.pendingValueByMonth;
          }
        }

        // Calcula saldo total disponível no mês em todas as contas de recurso financeiro
        if ([2].includes(this.operation.oprTypeId) && this.cfpService.owner.id) {
          // Calcula os saldos
          let balanceByMonth$ = this.balanceService.getMonthFundsByOwnerId(this.cfpService.owner.id || 0);
          let pendingValueByMonth$ = this.balanceService.getMonthPendingsByOwnerId(this.cfpService.owner.id || 0);
          // Prepara array de Promise para executar consulta aos saldos
          let promiseArray = [balanceByMonth$.toPromise(), pendingValueByMonth$.toPromise()];
          let valueArray = await Promise.all(promiseArray);
          // Armazena o valor correspondente em cada variável do componente
          this.balanceByMonth = valueArray[0] ? valueArray[0].value || 0 : 0;
          this.pendingValueByMonth = valueArray[1] ? valueArray[1].value || 0 : 0;
          // Ajustar label
          this.cfpService.shallLabel = 'Recursos disponíveis';
          // Atualiza saldo do recurso
          this.cfpService.shallValue = this.balanceByMonth - this.pendingValueByMonth;
        }

        if ([1, 3, 4, 8].includes(this.operation.oprTypeId || 0)) {
          this.balanceByMonth = 0;
          this.pendingValueByMonth = 0;
          this.cfpService.shallValue = 0;
          this.cfpService.defaultFooter();
        }

      }

      resolve(true);
    });
  }

  checkOperationChange() {
    this.isOperationChanged = (
      this.isDescriptionChanged ||
      this.isOprDateChanged ||
      this.isQtyPaymentsChanged ||
      this.isStartDateChanged ||
      this.isValueChanged ||
      this.isVersionChanged ||
      this.isOprTypeIdChanged ||
      this.isOprSourceAccountIdChanged ||
      this.isOprDestinyAccountIdChanged
    );
  }
  descriptionChange(description: string) {
    this.operation.description = description
    this.isDescriptionChanged = (this.operation.description != this.oldOperation.description)
    this.checkOperationChange()
  }
  oprDateChange(oprDate: Date) {
    this.operation.oprDate = oprDate
    this.isOprDateChanged = (this.operation.oprDate != this.oldOperation.oprDate)
    this.checkOperationChange()
  }
  qtyPaymentsChange(qtyPayments: number) {
    this.operation.qtyPayments = qtyPayments
    this.isQtyPaymentsChanged = (this.operation.qtyPayments != this.oldOperation.qtyPayments)
    this.checkOperationChange()
  }
  startDateChange(startDate: Date) {
    this.operation.startDate = startDate
    this.isStartDateChanged = (this.operation.startDate != this.oldOperation.startDate)
    this.checkOperationChange()
  }
  valueChange(value: number) {
    this.operation.value = value
    this.isValueChanged = (this.operation.value != this.oldOperation.value)
    this.checkOperationChange()
  }
  versionChange(version: Date) {
    this.operation.version = version
    this.isVersionChanged = (this.operation.version != this.oldOperation.version)
    this.checkOperationChange()
  }
  oprTypeIdChange(oprTypeId: number) {
    this.operation.oprTypeId = oprTypeId
    this.isOprTypeIdChanged = (this.operation.oprTypeId != this.oldOperation.oprTypeId)
    this.checkOperationChange()
  }
  oprSourceAccountIdChange(oprSourceAccountId: number) {
    this.operation.oprSourceAccountId = oprSourceAccountId
    this.isOprSourceAccountIdChanged = (this.operation.oprSourceAccountId != this.oldOperation.oprSourceAccountId)
    this.checkOperationChange()
  }
  oprDestinyAccountIdChange(oprDestinyAccountId: number) {
    this.operation.oprDestinyAccountId = oprDestinyAccountId
    this.isOprDestinyAccountIdChanged = (this.operation.oprDestinyAccountId != this.oldOperation.oprDestinyAccountId)
    this.checkOperationChange()
  }

  public isOperationChanged: boolean = false;
  public isDescriptionChanged: boolean = false;
  public isOprDateChanged: boolean = false;
  public isQtyPaymentsChanged: boolean = false;
  public isStartDateChanged: boolean = false;
  public isValueChanged: boolean = false;
  public isVersionChanged: boolean = false;
  public isOprTypeIdChanged: boolean = false;
  public isOprSourceAccountIdChanged: boolean = false;
  public isOprDestinyAccountIdChanged: boolean = false;

  hintDescriptionByOperationType(oprTypeId: number): string {
    switch (oprTypeId) {
      case 1:
        return 'Ex: Crédito em conta corrente ...';
      case 2:
        return 'Ex: Reserva para pagamento de ...';
      case 3:
        return 'Ex: Transferência de valor para ...';
      case 4:
        return 'Ex: Transferência de reserva financeira para ...';
      case 5:
        return 'Ex: Pagamento de ...';
      case 6:
        return 'Ex: Compra de ...';
      case 7:
        return 'Ex: Pagamento agendado de ...';
      case 8:
        return 'Ex: Previsão de despesa com ...';
      default:
        return 'Forneça breve histórico da operação.';
    }
  }

  hintOprDateByOperationType(oprTypeId: number): string {
    switch (oprTypeId) {
      case 1:
        return 'Data do crédito';
      case 2:
        return 'Data da reserva';
      case 3:
      case 4:
        return 'Data da transferência';
      case 5:
      case 7:
        return 'Data de pagamento';
      case 6:
        return 'Data da compra';
      case 8:
        return 'Data prevista';
      default:
        return 'Data do registro';
    }
  }

  hintValueByOperationType(oprTypeId: number): string {
    switch (oprTypeId) {
      case 1:
        return 'Valor do crédito recebido na conta';
      case 2:
        return 'Valor a reservar para desepesas futuras';
      case 3:
      case 4:
        return 'Valor a ser tranferido';
      case 5:
        return 'Valor do pagamento';
      case 6:
        return 'Valor total da compra';
      case 7:
        return 'Valor total do pagamento';
      case 8:
        return 'Valor previsto';
      default:
        return 'Valor da operação';
    }
  }

  actionByOperationType(oprTypeId: number): string {
    switch (oprTypeId) {
      case 1:
        return 'RECEBER';
      case 2:
        return 'RESERVAR';
      case 3:
      case 4:
        return 'TRANSFERIR';
      case 5:
      case 6:
        return 'PAGAR';
      case 7:
      case 8:
        return 'AGENDAR';
      default:
        return 'REGISTRAR';
    }
  }

}
