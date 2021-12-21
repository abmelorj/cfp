import { AccountCreateComponent } from './views/account/account-create/account-create.component';
import { AccountUpdateComponent } from './views/account/account-update/account-update.component';
import { AccountListComponent } from './views/account/account-list/account-list.component';
import { AccessGrantOpenComponent } from './views/access-grant/access-grant-open/access-grant-open.component';
import { AccessGrantCreateComponent } from './views/access-grant/access-grant-create/access-grant-create.component';
import { AccessGrantComponent } from './views/access-grant/access-grant/access-grant.component';
import { CategoryEditComponent } from './views/category/category-edit/category-edit.component';
import { CategoryCreateComponent } from './views/category/category-create/category-create.component';
import { SignComponent } from './components/account/sign/sign.component';
import { AuthGuard } from './services/auth.guard';
import { SignUpComponent } from './components/account/sign-up/sign-up.component';
import { SignInComponent } from './components/account/sign-in/sign-in.component';
import { AuthComponent } from './views/auth/auth.component';
import { HomeComponent } from './views/home/home.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CategoryComponent } from './views/category/category.component';

const routes: Routes = [

  {
    path: '', component: HomeComponent,
    children: [
      { path: 'access-grant/open', component: AccessGrantOpenComponent },
      { path: 'access-grant/create', component: AccessGrantCreateComponent },
      { path: 'access-grant', component: AccessGrantComponent },
      { path: 'account/list/:id', component: AccountListComponent },
      { path: 'account/update/:id', component: AccountUpdateComponent },
      { path: 'account/create', component: AccountCreateComponent },
      { path: 'category/create', component: CategoryCreateComponent },
      { path: 'category/edit/:id', component: CategoryEditComponent },
      { path: 'category', component: CategoryComponent },
      { path: '', redirectTo: 'category', pathMatch: 'full' },
      // { path: '**', redirectTo: 'category' } // rota não atendida é redirecionada para a tela inicial
    ],
    canActivate: [AuthGuard]
  },
  {
    path: '', component: AuthComponent,
    children: [
      { path: 'sign', component: SignComponent },
      { path: 'signin', component: SignInComponent },
      { path: 'signup', component: SignUpComponent },
      { path: '', redirectTo: 'sign', pathMatch: 'full' },
      // { path: '**', redirectTo: 'sign' } // rota não atendida é redirecionada para a tela inicial
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
