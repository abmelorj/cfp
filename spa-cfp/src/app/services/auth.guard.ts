import { CFPService } from 'src/app/services/cfp.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient,
    private cfp: CFPService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    // Função auxiliar para redirecionar para tela de registro/autenticação e retornar falso...
    const goToSign = () => {
      this.router.navigate(['sign'])
      return false
    }

    // Se possuir token dentro da validade...
    const token = this.cfp.token()
    if (token && !this.cfp.isTokenExpired(token)) {
      // Verifica se o token é valido...
      return this.http
        .post<any>(`${environment.auth}/validate`, { token })
        .toPromise()
        .then((user) => {
          if (user && user.valid && user.id) {
            // Memoriza usuário logado
            this.cfp.setUser({ ...user })
            // Se proprietário não estiver definido, considera o usuário logado
            if (this.cfp.ownerNotDefined())
              this.cfp.setOwner({ ...user });
            return true
          } else {
            // Token inválido...
            return goToSign()
          }
        }, () => {
          // Chamada rejeitada...
          return goToSign()
        })
        .catch(() => {
          // Ocorreu erro...
          return goToSign()
        })
    } else {
      // Sem token dentro da validade...
      return new Promise<boolean>(() => goToSign())
    }

  }

}
