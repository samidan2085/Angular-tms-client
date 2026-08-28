import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  AuthService
} from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn =
  (req, next) => {

    const authService =
      inject(AuthService);

    const token =
      authService.getToken();

    console.log(
      'HTTP REQUEST:',
      req.method,
      req.url
    );

    console.log(
      'JWT EXISTS:',
      !!token
    );

    if (!token) {

      console.warn(
        'NO JWT TOKEN'
      );

      return next(req);
    }

    const authRequest =
      req.clone({

        setHeaders: {

          Authorization:
            `Bearer ${token}`

        }

      });

    console.log(
      'AUTHORIZATION HEADER ADDED'
    );

    return next(authRequest);
  };