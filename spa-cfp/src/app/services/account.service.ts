import { Account } from 'src/app/models/account.interface';
import { Balance } from 'src/app/models/balance.interface';
import { CFPService } from './cfp.service';
import { environment } from 'src/environments/environment'
import { Value } from 'src/app/models/value.interface';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccountService {

  // preencher no constructor() do componente AccountListComponent
  // esta lógica está sendo centralizada no CFP service.
  // Falta preencher a categoria selecionada no momento que acionar a lista de contas
  accountName = ''

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  listAccountsByCategoryId(categoryId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.api}/categories/${categoryId}/accounts`)
  }

  listAccountsByOwnerId(ownerId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.api}/accounts/owner/${ownerId}`)
  }

  addAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(`${environment.api}/accounts`, account)
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${environment.api}/accounts/${id}`)
  }

  getAccountBalance(id: number): Observable<Balance> {
    return this.http.get<Balance>(`${environment.api}/accounts/${id}/balance`)
  }

  getAccountBalanceByMonth(id: number): Observable<Balance> {
    return this.http.get<Balance>(`${environment.api}/accounts/${id}/balance/${this.cfp.yearMonth}`)
  }

  getAccountPendingValue(id: number): Observable<Value> {
    return this.http.get<Value>(`${environment.api}/accounts/${id}/pendingValue`)
  }

  getAccountPendingValueByMonth(id: number): Observable<Value> {
    return this.http.get<Value>(`${environment.api}/accounts/${id}/pendingValue/${this.cfp.yearMonth}`)
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${environment.api}/accounts`, account)
  }

  deleteAccount(id: number): Observable<Account> {
    return this.http.delete<Account>(`${environment.api}/accounts/${id}`)
  }
}
