'use strict';
import { AccountListComponent } from './../views/account/account-list/account-list.component';
import { Category } from 'src/app/models/category.interface';
import { CategoryComponent } from './../views/category/category.component';
import { OperationListComponent } from './../views/operation/operation-list/operation-list.component';
import { User } from 'src/app/models/user.interface';

import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { MatSnackBar } from '@angular/material/snack-bar'
import jwt_decode from 'jwt-decode';
import { Account } from '../models/account.interface';
import { Operation } from '../models/operation.interface';

@Injectable({
    providedIn: 'root'
})

export class CFPService {
    constructor(
        private snackBar: MatSnackBar
    ) {
        this.shallLabel = 'Obrigação pendente'
        this.shallValue = 0.00
        this.balanceValue = 0.00
        this.finalBalanceValue = 0.00
    }

    // Header
    public moduleName: string = 'Categoria'
    public yearMonth: number = 0;

    // Footer
    public shallLabel: string = 'Obrigação pendente';
    public shallValue: number = 0;
    public balanceLabel: string = 'Saldo no mês';
    public balanceValue: number = 0;
    public finalBalanceLabel: string = 'Saldo final';
    public finalBalanceValue: number = 0;

    defaultFooter() {
        this.shallLabel = 'Obrigação pendente';
        this.balanceLabel = 'Saldo no mês';
        this.finalBalanceLabel = 'Saldo final';
    }

    // CFP User Logged
    public user: User = { id: 0, email: '' }
    setUser(user: User): void {
        this.user = { ...user }
    }

    // CFP Owner
    public owner: User = { id: 0, email: '' }
    setOwner(owner: User): void {
        this.owner = { ...owner }
    }
    ownerNotDefined(): boolean {
        return this.owner.id == 0 && this.owner.email == ''
    }

    // Category Component, armazena a referência do componente CategoryComponent para:
    // - setar o tabIndex da aba de categorias a partir do menu no HomeComponent;
    // - atualizar lista de categorias e saldos quando alterar o mês selecionado no MonthComponent.
    public categoryComponent?: CategoryComponent
    private categoryTabIndex?: number
    public getCategoryTabIndex(): number {
        return this.categoryTabIndex || 0
    }
    public setCategoryTabIndex(index: number) {
        this.categoryTabIndex = index
        if (this.categoryComponent)
            this.categoryComponent.categoryTabIndex = index
    }
    public setCategoryTabIndexCFPonly(index: number) {
        this.categoryTabIndex = index
    }

    // Category in use
    public category: Category = { catOwnerId: 0, isCredit: false, name: '' };
    setCategory(category: Category): void {
        this.category = { ...category };
    }

    // Account in use
    public account: Account = { name: '', isCredit: false, isCard: false, accCategoryId: 0 };
    setAccount(account: Account): void {
        this.account = { ...account };
    }

    // Operation in use
    public operation: Operation = { description: '', oprDate: new Date(), value: 0, oprTypeId: 0 };
    setOperation(operation: Operation): void {
        this.operation = { ...operation };
    }

    // Account List Component, armazena a referência do componente AccountListComponent para:
    // - atualizar lista de contas e saldos quando alterar o mês selecionado no MonthComponent.
    public accountListComponent?: AccountListComponent;

    // Operation List Component, armazena a referência do componente OperationListComponent para:
    // - atualizar lista de operações e saldos quando alterar o mês selecionado no MonthComponent.
    public operationListComponent?: OperationListComponent;

    async digest(message: string, algorithm = 'SHA-512') {
        // encode as (utf-8) Uint8Array
        const msgUint8 = new TextEncoder().encode(message);
        // hash the message                 
        const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
        // convert buffer to byte array
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        // convert bytes to hex string
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    authorization(): HttpHeaders {
        return new HttpHeaders({ Authorization: this.token() || '' })
    }

    token() {
        return localStorage.getItem('cfptoken')
    }

    storeToken(token: string) {
        window.localStorage.setItem('cfptoken', token)
    }

    removeToken(): void {
        localStorage.removeItem('cfptoken')
    }

    getTokenExpirationDate(token: string): Date {
        const decoded: any = jwt_decode(token)
        let date = new Date(0)
        if (decoded.exp !== undefined)
            date.setUTCSeconds(decoded.exp);
        return date
    }

    isTokenExpired(token?: string): boolean {
        if (!token) return true;
        const date = this.getTokenExpirationDate(token)
        return (date.valueOf() <= new Date().valueOf())
    }

    showMessage(msg: string): void {
        this.snackBar.open(msg, 'X', {
            duration: 3000,
            horizontalPosition: "center",
            verticalPosition: "top"
        });
    }
}