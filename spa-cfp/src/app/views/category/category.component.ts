import { CFPService } from 'src/app/services/cfp.service';
import { Category } from '../../models/category.interface';
import { CategoryService } from '../../services/category.service';
import { Component, Input, OnInit, AfterContentChecked } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit, AfterContentChecked {

  @Input() categories: Category[] = [];
  @Input() reservs: Category[] = [];
  @Input() funds: Category[] = [];

  public categoryTabIndex?: number;

  constructor(
    private categoryService: CategoryService,
    private cfpService: CFPService
  ) {
    // Armazena a referência do componente CategoryComponent no service 
    // para alterar o tabIndex do menu no HomeComponent.
    cfpService.categoryComponent = this;

    // Recupera a lista de categorias do controle financeiro
    categoryService.findCategoriesByOwnerId()
      .subscribe(categoryArrayApi => {
        this.categories = categoryArrayApi
        this.updateCategoryArray()
      }, err => cfpService.showMessage(err));
  }

  ngOnInit(): void {
    this.cfpService.moduleName = 'Categoria'
    // Seleciona a aba que estava aberta, se for o caso
    if (this.categoryTabIndex === undefined && this.cfpService)
      this.categoryTabIndex = this.cfpService.getCategoryTabIndex();
  }

  ngAfterContentChecked(): void {
    if (this.categoryTabIndex !== undefined)
      this.cfpService.setCategoryTabIndexCFPonly(this.categoryTabIndex);
  }

  updateCategoryArray(): void {
    // Distribui a lista 
    if (this.categories)
      this.categories.forEach(category => {
        if (category.isActive) {
          if (category.isCredit && !this.categoryService.isCreditCardCategory(category.name)) {
            this.reservs.push(category)
          } else {
            this.funds.push(category)
          }
        }
      })
  }

}
