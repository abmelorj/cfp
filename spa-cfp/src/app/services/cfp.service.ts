import { Category } from 'src/app/models/category.interface';
'use strict';

import { Injectable } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { MatSnackBar } from '@angular/material/snack-bar'
import jwt_decode from 'jwt-decode';
import { CategoryComponent } from './../views/category/category.component';
import { User } from 'src/app/models/user.interface';

@Injectable({
    providedIn: 'root'
})

export class CFPService {
    constructor(
        private snackBar: MatSnackBar
    ) {
        this.shallValue = 0.00
        this.balanceValue = 0.00
        this.finalBalanceValue = 0.00
    }

    // Header
    public moduleName: string = 'Categoria'
    public yearMonth: number = 0;

    // Footer
    public shallValue: number = 0;
    public balanceValue: number = 0;
    public finalBalanceValue: number = 0;

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

    // Category Component, usado para selecionar a aba a partir do menu.
    private categoryTabIndex?: number
    public getCategoryTabIndex(): number {
        return this.categoryTabIndex || 0
    }
    public categoryComponent?: CategoryComponent
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