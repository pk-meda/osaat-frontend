import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { AuthenticationService } from './auth/authentication.service';
import { environment } from 'src/environments/environment';
import { ApiService } from '../services/api.service';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';
export const InterceptorSkipAuthHeader = 'X-SkipAuth-Interceptor';
import { jwtDecode } from 'jwt-decode';
import { EncryptionService } from './encryption/encryption.service';
import { ToastController } from '@ionic/angular';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private _authenticationService: AuthenticationService,
    private encryptionService: EncryptionService,
    private api: ApiService,
    private toaster: ToastController
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const currentUser = this._authenticationService.currentUserValue;
    const isLoggedIn = !!(currentUser && currentUser.token);
    const rawToken = localStorage.getItem('sommai-auth-token');

    // 1. SAFELY handle encrypted/decoded token to prevent JSON.parse crashes
    let decodeToken: any = null;
    if (currentUser && rawToken) {
      try {
        const decodedString = this.encryptionService.decode(rawToken);
        decodeToken = decodedString ? JSON.parse(decodedString) : null;
      } catch (e) {
        // If decryption/JSON.parse fails, fall back gracefully instead of breaking the request pipeline
        decodeToken = null;
      }
    }

    const isApiUrl = request.url.includes('/api/') || request.url.startsWith(environment.baseApiUrl);
    
    // List of endpoints that expect DRF 'Token' instead of 'Bearer'
    const openEndpoints = [
      'get_all_participants',
      'first-screening',
      'Second-screening',
      'complaints',
      'reports' // Added reports here if DRF Token auth is expected
    ];

    const isApiUrlsOpen = openEndpoints.some(endpoint => request.url.includes(endpoint));

    let decodedToken: any;
    let currentTime: any;
    if (decodeToken && decodeToken.token) {
      try {
        decodedToken = jwtDecode(decodeToken.token);
        currentTime = Math.floor(Date.now() / 1000);
      } catch (e) {
        // Safe catch for invalid JWT structures
      }
    }

    let modifiedRequest = request.clone();

    // Check if request already has explicit Authorization header (e.g. from ReportService)
    const hasAuthHeader = request.headers.has('Authorization');

    const skipAuth = request.headers.has(InterceptorSkipAuthHeader);
    if (skipAuth) {
      modifiedRequest = modifiedRequest.clone({ 
        headers: modifiedRequest.headers.delete(InterceptorSkipAuthHeader) 
      });
      return next.handle(modifiedRequest);
    }

    if (isApiUrl && !hasAuthHeader) {
      const activeToken = currentUser?.token || this._authenticationService.tempToken;
      if (activeToken) {
        const authPrefix = isApiUrlsOpen ? 'Token' : 'Bearer';
        modifiedRequest = modifiedRequest.clone({
          setHeaders: {
            Authorization: `${authPrefix} ${activeToken}`
          }
        });
      }
    }

    return next.handle(modifiedRequest).pipe(
      tap(ev => {
        if (ev instanceof HttpResponse) {
          if (ev.status === 200 && ev.body?.auth === false) {
            this._authenticationService.logout();
          }
        }
      }),
      catchError((err: any) => {
        if (err.status === 401) {
          return this.handle401Error(modifiedRequest, next).pipe(
            catchError(refreshErr => {
              console.error('Failed to refresh token:', refreshErr);
              this._authenticationService.logout();
              this.presentToast('Your session has expired, please login again.', 'danger');
              return throwError(() => refreshErr);
            })
          );
        }
        return throwError(() => err);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const storedRefreshToken = this._authenticationService.currentUserValue?.refresh_token;

    if (!storedRefreshToken) {
      this._authenticationService.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    const body = { refresh: storedRefreshToken };

    return this.api.refresh(body).pipe(
      switchMap((res: any) => {
        const newAccessToken = res.access_token || res.access;

        if (this._authenticationService.currentUserValue) {
          this._authenticationService.currentUserValue.token = newAccessToken;
        }

        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${newAccessToken}`
          }
        });

        return next.handle(clonedRequest);
      }),
      catchError(refreshError => throwError(() => refreshError))
    );
  }

  async presentToast(msg: any, color: any = 'success', position: any = 'top') {
    const toast = await this.toaster.create({
      message: msg,
      color: color,
      position: position,
      duration: 2000
    });
    toast.present();
  }
}