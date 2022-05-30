// Angular
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData, HashLocationStrategy, LocationStrategy } from '@angular/common';
import localePt from '@angular/common/locales/pt'
registerLocaleData(localePt);
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular - Material Design
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MaterialExampleModule } from './components/material.module';

// CFP
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/template/header/header.component';
import { FooterComponent } from './components/template/footer/footer.component';
import { HomeComponent } from './views/home/home.component'
import { MonthComponent } from './components/month/month.component'
import { CategoryComponent } from './views/category/category.component';
import { UserService } from './services/user.service';
import { CategoryService } from './services/category.service';
import { ListItemComponent } from './components/template/list-item/list-item.component';

import { AuthComponent } from './views/auth/auth.component';
import { SignInComponent } from './components/account/sign-in/sign-in.component';
import { SignUpComponent } from './components/account/sign-up/sign-up.component';
import { SignComponent } from './components/account/sign/sign.component';
import { httpInterceptorProviders } from './http-interceptors';
import { CategoryCreateComponent } from './views/category/category-create/category-create.component';
import { CategoryEditComponent } from './views/category/category-edit/category-edit.component';
import { AccessGrantComponent } from './views/access-grant/access-grant/access-grant.component';
import { AccessGrantCreateComponent } from './views/access-grant/access-grant-create/access-grant-create.component';
import { AccessGrantOpenComponent } from './views/access-grant/access-grant-open/access-grant-open.component';
import { AccountListComponent } from './views/account/account-list/account-list.component';
import { AccountCreateComponent } from './views/account/account-create/account-create.component';
import { AccountUpdateComponent } from './views/account/account-update/account-update.component';
import { OperationListComponent } from './views/operation/operation-list/operation-list.component';
import { OperationCreateComponent } from './views/operation/operation-create/operation-create.component';
import { OperationUpdateComponent } from './views/operation/operation-update/operation-update.component';
import { ShallListComponent } from './views/shall/shall-list/shall-list.component';
import { ShallUpdateComponent } from './views/shall/shall-update/shall-update.component';
import { ShallCreateComponent } from './views/shall/shall-create/shall-create.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    CategoryComponent,
    MonthComponent,
    ListItemComponent,
    AuthComponent,
    SignInComponent,
    SignUpComponent,
    SignComponent,
    CategoryCreateComponent,
    CategoryEditComponent,
    AccessGrantComponent,
    AccessGrantCreateComponent,
    AccessGrantOpenComponent,
    AccountListComponent,
    AccountCreateComponent,
    AccountUpdateComponent,
    OperationListComponent,
    OperationCreateComponent,
    OperationUpdateComponent,
    ShallListComponent,
    ShallUpdateComponent,
    ShallCreateComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialExampleModule,
    HttpClientModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    HomeComponent,
    // CategoryComponent,
    UserService,
    CategoryService,
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
