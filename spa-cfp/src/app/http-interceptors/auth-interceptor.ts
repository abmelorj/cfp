import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CFPService } from 'src/app/services/cfp.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private cfpService: CFPService,
        private router: Router
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const token = this.cfpService.token()
        let request: HttpRequest<any> = req

        if (token && !this.cfpService.isTokenExpired(token))
            // Como o request é readonly é necessário clonar para adicionar o header
            request = req.clone({ headers: req.headers.set('Authorization', token) })

        return next.handle(request)
            .pipe(catchError(this.handleError.bind(this)))
    }

    private handleError(error: HttpErrorResponse) {
        let errMessage: string
        if (error.error instanceof ErrorEvent)
            // Erro no Client
            errMessage = error.error.message
        else {
            // Erro no Backend
            errMessage = `[${error.status}] ${error.error.message}`
            if (error.status == 403)
                this.router.navigate(['/sign']);
        }
        return throwError(errMessage)
    }
}