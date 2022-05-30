import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationType } from '../models/operation-type.interface';
import { CFPService } from './cfp.service';
import { environment } from 'src/environments/environment'


@Injectable({
  providedIn: 'root'
})
export class OperationTypeService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  listOperationTypes(): Observable<OperationType[]> {
    return this.http
      .get<OperationType[]>(`${environment.api}/operationtypes`)
  }

  getOperationTypeById(id: number): Observable<OperationType> {
    return this.http
      .get<OperationType>(`${environment.api}/operationtypes/${id}`)
  }

}
