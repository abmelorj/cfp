import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'
import { AccessRule } from 'src/app/models/access-rule.interface';
import { CFPService } from './cfp.service';

@Injectable({
  providedIn: 'root'
})
export class AccessRuleService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }


  listAccessRules(): Observable<AccessRule[]> {
    return this.http
      .get<AccessRule[]>(`${environment.api}/accessrules`)
  }

  getAccessRuleById(id: number): Observable<AccessRule> {
    return this.http
      .get<AccessRule>(`${environment.api}/accessrules/${id}`)
  }

}