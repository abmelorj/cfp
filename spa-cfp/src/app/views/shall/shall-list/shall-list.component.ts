import { AccountService } from './../../../services/account.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Operation } from 'src/app/models/operation.interface';
import { OperationService } from 'src/app/services/operation.service';
import { Shall } from 'src/app/models/shall.interface';


import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, DoCheck, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ShallService } from 'src/app/services/shall.service';

@Component({
  selector: 'app-shall-list',
  templateUrl: './shall-list.component.html',
  styleUrls: ['./shall-list.component.css']
})
export class ShallListComponent implements OnInit {
  // lista as parcelas independente do mês selecionado.

  displayedColumns: string[] = ['oprDate', 'description', 'value', 'action'];

  @Input() shalls$: Observable<Shall[]> = new Observable<Shall[]>();
  @Input() operationDescription: string = '';
  @Input() operationId: number;

  private paidValue: number = 0;
  private pendingValue: number = 0;
  private totalValue: number = 0;

  constructor(
    private accountService: AccountService,
    public cfpService: CFPService,
    private operationService: OperationService,
    private shallService: ShallService,
    private route: ActivatedRoute,
  ) {
    // TO-DO: Bloquear a alteração do mês selecionado no MonthComponent.

    // Captura o Id da operação informada na rota.
    this.operationId = parseInt(route.snapshot.paramMap.get('id') || '0');

    // Recupera operação pelo Id na rota
    operationService.getOperationById(this.operationId)
      .subscribe(operation => {
        cfpService.setOperation(operation);
        this.operationDescription = operation.description;
        // this.cfpService.moduleName = this.operationDescription;
      }
        , err => cfpService.showMessage(err));
  }


  ngOnInit(): void {
    // Recupera a lista de operações da conta selecionada
    this.loadShalls();
    this.cfpService.shallLabel = 'Liquidado';
    this.cfpService.balanceLabel = 'Pendente de pagamento';
    this.cfpService.finalBalanceLabel = 'Valor total';

  }

  ngDoCheck(): void {
    this.cfpService.shallValue = this.paidValue;
    this.cfpService.balanceValue = this.pendingValue;
    this.cfpService.finalBalanceValue = this.totalValue;
  }

  ngOnDestroy(): void {
    // Reseta referência ao destruir para evitar erro no MonthComponent
    // this.cfpService.operationListComponent = undefined;

    // Reseta os labels detaul do Footer.
    this.cfpService.defaultFooter();
  }

  loadShalls() {
    return new Promise(async (resolve) => {
      // Recupera a lista de obrigações da operação selecionada
      this.shalls$ = this.shallService.listShallByOperationId(this.operationId);

      // Calcula os saldos
      let shalls = await Promise.all([this.shalls$.toPromise()]);
      shalls[0].forEach(shall => {
        // Armazena o valor correspondente em cada variável do componente
        this.totalValue = this.totalValue + shall.value;
        if (shall.isPending)
          this.pendingValue = this.pendingValue + shall.value
        else
          this.paidValue = this.paidValue + shall.value;
      })

      resolve(true);
    });
  }

  strBrlDateToString(strBrlDate: string) {
    // Recebe: date
    // Retorna: string no formato de data no Brasil
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', year: '2-digit', month: '2-digit', day: '2-digit' }).format(Date.parse(strBrlDate) + 1000 * 60 * 60 * 3)
  }

}
