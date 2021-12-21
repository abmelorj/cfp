import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from './../../../services/category.service';
import { CFPService } from 'src/app/services/cfp.service';
import { Category } from 'src/app/models/category.interface';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.css']
})
export class CategoryEditComponent implements OnInit {

  category: Category
  oldValue: Category
  placeHolderText: string
  tabIndex: number

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cfpService: CFPService,
    private categoryService: CategoryService
  ) {
    // Inicializa ou recupera a última aba visível
    this.tabIndex = cfpService.categoryComponent?.categoryTabIndex || 0;
    if (this.tabIndex == 0)
      this.placeHolderText = 'Reserva financeira'
    else
      this.placeHolderText = 'Recurso financeiro';
    // Inicializa registro para alteração de categoria
    this.category = {
      name: '',
      isCredit: this.tabIndex == 0 ? true : false,
      catOwnerId: cfpService.owner.id || 0
    }
    this.oldValue = this.category
  }

  ngOnInit(): void {
    // Carrega a categoria identificada no path
    const id: number = parseInt(this.route.snapshot.paramMap.get('id') || "0")
    this.categoryService.getCategoryById(id)
      .subscribe((category: Category) => {
        this.category = category
        // Tem que criar um novo objeto senão será outra referência para o mesmo objeto em memória
        this.oldValue = { ...category }
      })
  }

  updateCategory(): void {
    try {
      // Atualiza categoria
      this.categoryService.updateCategory(this.category).subscribe({
        next: (category: Category) => {
          this.cfpService.showMessage('Categoria atualizada!')
          // Navega para a lista de categorias, selecionando a aba que estava visíviel
          this.router.navigate(['category'])
          this.cfpService.setCategoryTabIndex(this.tabIndex);
        },
        error: (err: any) => this.cfpService.showMessage(err)
      })
    } catch (error: any) {
      this.cfpService.showMessage(error.toString())
    }
  }

  deleteCategory(): void {
    try {
      // Exclui categoria
      this.categoryService.deleteCategory(this.category.id || 0).subscribe({
        next: () => {
          this.cfpService.showMessage('Categoria excluída!')
          // Navega para a lista de categorias, selecionando a aba que estava visíviel
          this.router.navigate(['category'])
          this.cfpService.setCategoryTabIndex(this.tabIndex);
        },
        error: (err: any) => this.cfpService.showMessage(err)
      })
    } catch (error: any) {
      this.cfpService.showMessage(error.toString())
    }
  }

  nameChange(name: string) {
    this.category.name = name
    this.isNameChanged = (this.category.name != this.oldValue.name)
  }
  public isNameChanged: boolean = false;

}
