import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import { environment} from "../../environments/environment";
import {Observable} from "rxjs";
import {User} from "../model/user";
import { JwtHelperService} from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public host: string = environment.apiUrl;
  private token: string | undefined | null;
  private loggedInUsername: string | undefined | null;
  private jwtHelper = new JwtHelperService();

  constructor( private http: HttpClient) { }

  public login(user: User): Observable<HttpResponse<any> | HttpErrorResponse> {
    return this.http.post<HttpResponse<any> | HttpErrorResponse>(`${this.host}/user/login`, user, {observe: 'response'})
  }

  public register(user: User): Observable<User | HttpErrorResponse> {
    return this.http.post<User | HttpErrorResponse>(`${this.host}/user/register`, user);
  }

  public logOut(): void {
    this.token = null;
    this.loggedInUsername = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  public addUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | null {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  public loadToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.token = token;
    }
  }

  public getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    return null;
  }

  public isLoggedIn(): boolean {
    this.loadToken();
    if (!this.token) {
      this.logOut();
      return false;
    }
    try {
      const decodedToken = this.jwtHelper.decodeToken(this.token);
      if (decodedToken?.sub && !this.jwtHelper.isTokenExpired(this.token)) {
        this.loggedInUsername = decodedToken.sub;
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    this.logOut();
    return false;
  }


}
