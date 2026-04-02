import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  return next(cloned);
};
