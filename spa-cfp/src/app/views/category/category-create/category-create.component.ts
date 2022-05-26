import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from './../../../services/category.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Category } from 'src/app/models/category.interface';

@Component({
  selector: 'app-category-create',
  templateUrl: './category-create.component.html',
  styleUrls: ['./category-create.component.css']
})
export class CategoryCreateComponent {

  category: Category
  placeHolderText: string
  tabIndex: number

  constructor(
    private router: Router,
    private cfpService: CFPService,
    private categoryService: CategoryService
  ) {
    // Inicializa ou recupera a última aba visível
    this.tabIndex = cfpService.getCategoryTabIndex();
    if (this.tabIndex == 0)
      this.placeHolderText = 'Reserva financeira'
    else
      this.placeHolderText = 'Recurso financeiro';
    // Inicializa registro para inclusão de categoria
    this.category = {
      name: '',
      isCredit: this.tabIndex == 0 ? true : false,
      catOwnerId: cfpService.owner.id || 0
    }
  }

  addCategory() {
    try {
      // Inclui categoria
      this.categoryService.addCategory(this.category).subscribe(() => {
        this.cfpService.showMessage('Categoria incluída!')
        // Navega para a lista de categorias, selecionando a aba que estava visíviel
        this.router.navigate(['category'])
        this.cfpService.setCategoryTabIndex(this.tabIndex);
      },
        err => this.cfpService.showMessage(err))
    } catch (error: any) {
      this.cfpService.showMessage(error.toString())
    }
  }

}
