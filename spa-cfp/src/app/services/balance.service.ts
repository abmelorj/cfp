import { Operation } from './../models/operation.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CFPService } from './cfp.service';
import { environment } from 'src/environments/environment';
import { Value } from '../models/value.interface';


@Injectable({
  providedIn: 'root'
})
export class BalanceService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  getMonthFundsByOwnerId(ownerId: number): Observable<Value> {
    return this.http.get<Value>(`${environment.api}/balances/${ownerId}/funds/${this.cfp.yearMonth}`)
  }

  getMonthPendingsByOwnerId(ownerId: number): Observable<Value> {
    return this.http.get<Value>(`${environment.api}/balances/${ownerId}/pendings/${this.cfp.yearMonth}`)
  }

}
