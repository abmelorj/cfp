import { Operation } from 'src/app/models/operation.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CFPService } from './cfp.service';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class OperationService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  addOperation(operation: Operation): Observable<Operation> {
    switch (operation.oprTypeId) {
      case 1:
        return this.http.post<Operation>(`${environment.api}/operations/credit`, operation)
      case 2:
        return this.http.post<Operation>(`${environment.api}/operations/reserv`, operation)
      case 3:
      case 4:
        return this.http.post<Operation>(`${environment.api}/operations/transfer`, operation)
      case 5:
      case 6:
      case 7:
        return this.http.post<Operation>(`${environment.api}/operations/pay`, operation)
      case 8:
        return this.http.post<Operation>(`${environment.api}/operations/forecast`, operation)
      default:
        return new Observable<Operation>();
    }
  }

  deleteOperation(operation: Operation): Observable<Operation> {
    console.log('================= DELETE: ', operation);
    return this.http.delete<Operation>(`${environment.api}/operations/${operation.id}`, { body: { version: operation.version } })
  }

  updateOperation(operation: Operation): Observable<Operation> {
    return this.http.put<Operation>(`${environment.api}/operations/${operation.id}`, operation)
  }

  getOperationById(id: number): Observable<Operation> {
    return this.http.get<Operation>(`${environment.api}/operations/${id}`)
  }

  listAccountOperationByMonth(accountId: string): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${environment.api}/accounts/${accountId}/operationsBy/${this.cfp.yearMonth}`)
  }

}

