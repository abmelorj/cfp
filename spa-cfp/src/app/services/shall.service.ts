import { CFPService } from 'src/app/services/cfp.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Shall } from '../models/shall.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShallService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  listShallByOperationId(operationId: number): Observable<Shall[]> {
    return this.http.get<Shall[]>(`${environment.api}/operations/${operationId}/shalls`)
  }

}
