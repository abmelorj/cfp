import { CFPService } from './../../services/cfp.service';
import { Component, OnInit } from '@angular/core';

import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
// import { default as _rollupMoment, Moment } from 'moment';
import { Moment } from 'moment';

// const moment = _rollupMoment || _moment;
const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class MonthComponent implements OnInit {
  date = new FormControl(moment());

  constructor(private cfpService: CFPService) { }

  ngOnInit(): void {
    this.cfpService.yearMonth = this.getYearMonth();
  }

  refreshViews(): void {
    // Atualizar a lista de categorias quando altera o mês selecionado
    if (this.cfpService.categoryComponent)
      this.cfpService.categoryComponent.loadCategories();
    // Atualizar a lista de contas quando altera o mês selecionado
    if (this.cfpService.accountListComponent)
      this.cfpService.accountListComponent.loadAccounts();
    // Atualizar a lista de operações quando altera o mês selecionado
    if (this.cfpService.operationListComponent)
      this.cfpService.operationListComponent.loadOperations();
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.cfpService.yearMonth = this.getYearMonth();
    this.refreshViews();
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.cfpService.yearMonth = this.getYearMonth();
    this.refreshViews();
  }

  getYearMonth() {
    // getMonth() vai de 0 a 11: jan a dez
    return this.date.value._d.getFullYear() * 100 + this.date.value._d.getMonth() + 1;
  }

}
