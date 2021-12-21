import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'
import { CFPService } from 'src/app/services/cfp.service';
import { Category } from 'src/app/models/category.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(
    private http: HttpClient,
    private cfp: CFPService) { }

  findCategoriesByOwnerId(): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${environment.api}/categories/owner/${this.cfp.owner.id}`)
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http
      .get<Category>(`${environment.api}/categories/${id}`)
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${environment.api}/categories`, category)
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${environment.api}/categories`, category)
  }

  deleteCategory(id: number): Observable<Category> {
    return this.http.delete<Category>(`${environment.api}/categories/${id}`)
  }

  isCreditCardCategory(name: string): boolean {
    const nameUpper = name.toUpperCase()
    return nameUpper == 'CARTÕES DE CRÉDITO' ||
      nameUpper == 'CARTÕES DE CRÉDITOS' ||
      nameUpper == 'CARTÃO DE CRÉDITO' ||
      nameUpper == 'CARTÃO DE CRÉDITOS'
  }

}
