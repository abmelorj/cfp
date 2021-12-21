import { User } from 'src/app/models/user.interface';
import { CFPService } from 'src/app/services/cfp.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService,
  ) { }

  // login
  async signin(user: any) {
    const result = await this.http.post<any>(`${environment.auth}/signin`, user).toPromise()
    if (result && result.token && result.id) {
      this.cfp.setUser({ ...result })
      this.cfp.setOwner({ ...result })
      this.cfp.storeToken(result.token)
      return true
    } else {
      return false
    }
  }

  // createAccount
  async signup(account: any) {
    const result = await this.http.post<any>(`${environment.auth}/signup`, account).toPromise()
    if (result && result.token && result.id) {
      this.cfp.setUser({ ...result })
      this.cfp.setOwner({ ...result })
      this.cfp.storeToken(result.token)
      return true
    } else {
      return false
    }
  }

  async getUserById(id: number): Promise<User> {
    return this.http.get<User>(`${environment.api}/users/${id}`).toPromise()
  }

}
