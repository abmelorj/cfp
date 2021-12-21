import { CategoryService } from './../../../services/category.service';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from './../../../services/account.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Component, OnInit, AfterContentChecked, Input } from '@angular/core';
import { Account } from 'src/app/models/account.interface';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
  styleUrls: ['./account-list.component.css']
})
export class AccountListComponent implements OnInit, AfterContentChecked {

  @Input() accounts: Account[] = [];
  @Input() categoryName: string = '';

  constructor(
    private route: ActivatedRoute,
    private cfpService: CFPService,
    private categoryService: CategoryService,
    private accountService: AccountService,
  ) {
    const categoryId = route.snapshot.paramMap.get('id') || '0';
    // Recupera categoria pelo Id na rota
    categoryService.getCategoryById(parseInt(categoryId))
      .subscribe(category => {
        cfpService.category = category;
        this.categoryName = this.cfpService.category.name;
      }
        , err => cfpService.showMessage(err));

    // Recupera a lista de contas da categoria selecionada
    accountService.listAccountsByCategoryId(categoryId)
      .subscribe(accountArrayApi => this.accounts = accountArrayApi
        , err => cfpService.showMessage(err));
    if (cfpService.getCategoryTabIndex() == 1)
      cfpService.moduleName = 'Recurso Financeiro'
    else
      cfpService.moduleName = 'Reserva Financeira';
  }

  ngOnInit(): void {

  }

  ngAfterContentChecked(): void {

  }

}
