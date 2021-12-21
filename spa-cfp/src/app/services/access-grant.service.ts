import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccessGrant } from 'src/app/models/access-grant.interface';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment'
import { CFPService } from './cfp.service';

@Injectable({
  providedIn: 'root'
})
export class AccessGrantService {

  constructor(
    public http: HttpClient,
    private cfp: CFPService,
    private user: UserService) { }


  // grantAccess(accessGrant: AccessGrant): Observable<AccessGrant> {
  //   return this.http
  //     .post<AccessGrant>(`${environment.api}/accessgrants`, accessGrant)
  // }


  tryAgain(msg: string = 'Dados incorretos!'): boolean {
    this.cfp.showMessage(`${msg} Tente novamente.`)
    return false
  }

  validateUser(userId: number, userEmail: string, ruleId: number) {
    return new Promise((resolve, reject) => {
      // Localiza usuário pelo ID
      this.user.getUserById(userId)
        .then(userFound => {
          if (!userFound) reject('Usuário não identificado.')
          // Compara se o email corresponde ao id
          if (userFound.email != userEmail) reject('Usuário não identificado.')
          // Verifica se usuário está concedendo acesso para o proprietário
          if (userFound.id == this.cfp.owner.id) reject('Gerencie acesso para outros usuários.')
          // Retorna objeto para conceder acesso
          resolve({
            agOwnerId: this.cfp.owner.id || 0,
            agGrantedUserId: userId,
            agAccessRuleId: ruleId
          })
        }, reason => reject(reason))
        .catch(err => reject(err))
    })
  }

  tryToGrant(accessToGrant: any) {
    return new Promise((resolve, reject) => {
      // Tenta conceder o acesso
      this.http.post<AccessGrant>(`${environment.api}/accessgrants`, accessToGrant).toPromise()
        .then((grantedAccess: AccessGrant) => {
          if (!grantedAccess) reject('Erro ao conceder acesso.')
          if (!grantedAccess.version) reject('Erro ao conceder acesso.')
          // Acesso concedido
          this.cfp.showMessage('Acesso concedido!')
          resolve(true)
        }, (reason: any) => reject(reason))
        .catch((err: Error) => reject(err))
    })
  }

  grantAccess(userId: number, userEmail: string, ruleId: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.validateUser(userId, userEmail, ruleId)
        .then(this.tryToGrant.bind(this), reason => reject(this.tryAgain(reason)))
        .then(() => resolve(true), reason => reject(this.tryAgain(reason)))
        .catch(err => reject(this.tryAgain(err)))
    })
  }

  revokeAccess(id: number): Observable<AccessGrant> {
    return this.http
      .delete<AccessGrant>(`${environment.api}/accessgrants/${id}`)
  }

  listAccessGrantedByOwnerId(id: number): Observable<AccessGrant[]> {
    return this.http
      .get<AccessGrant[]>(`${environment.api}/accessgrants/${id}/grants`)
  }

  listAccessGrantedByUserId(id: number): Observable<AccessGrant[]> {
    return this.http
      .get<AccessGrant[]>(`${environment.api}/accessgrants/${id}/granted`)
  }

}
