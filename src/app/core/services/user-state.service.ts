import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";


@Injectable({
     providedIn: 'root'
})
export class UserStateService {
    private initialLoggedIn = JSON.parse(localStorage.getItem('loggedIn') || 'false');
    private subjectLoggedIn = new BehaviorSubject<boolean>(this.initialLoggedIn);

    private initialRole = localStorage.getItem('Rol') || '';
    private subjectRole = new BehaviorSubject<string>(this.initialRole);

    private initialSpecialPermissions = localStorage.getItem('specialPermissions') || '';
    private subjectSpecialPermissions = new BehaviorSubject<string>(this.initialSpecialPermissions);

    private initialId = localStorage.getItem('id') || '';
    private subjectId = new BehaviorSubject<string>(this.initialId);

    private initialDepartments = localStorage.getItem('departments') || '';
    private subjectDepartments = new BehaviorSubject<string>(this.initialDepartments);

    private initialToken = localStorage.getItem('token') || '';
    private subjectToken = new BehaviorSubject<string>(this.initialToken);

    private initialExpirationCode = Number(localStorage.getItem('expirationCode')) || 0;
    private subjectExpirationCode = new BehaviorSubject<number>(this.initialExpirationCode);


    loggedIn$ = this.subjectLoggedIn.asObservable();
    role$ = this.subjectRole.asObservable();
    specialPermissions$ = this.subjectSpecialPermissions.asObservable();
    id$ = this.subjectId.asObservable();
    departments$ = this.subjectDepartments.asObservable();
    token$ = this.subjectToken.asObservable();
    expirationCode$ = this.subjectExpirationCode.asObservable();


    setLoggedIn = (value: boolean): void => {
        this.subjectLoggedIn.next(value);
        localStorage.setItem('loggedIn', JSON.stringify(value));
    };


    setRole = (value: string): void => {
        this.subjectRole.next(value);
        localStorage.setItem('Rol', value);
    };


    setSpecialPermissions = (value: string): void => {
        this.subjectSpecialPermissions.next(value);
        localStorage.setItem('specialPermissions', value);
    };


    setId = (value: string): void => {
        this.subjectId.next(value);
        localStorage.setItem('id', value);
    };


    setDepartments = (value: string): void => {
        this.subjectDepartments.next(value);
        localStorage.setItem('departments', value);
    };


    setToken = (value: string): void => {
        this.subjectToken.next(value);
        localStorage.setItem('token', value);
    };


    setExpirationCode = (value: number): void => {
        this.subjectExpirationCode.next(value);
        localStorage.setItem('expirationCode', value.toString());
    };


    logout = (): void => {
        this.setLoggedIn(false);
        localStorage.clear();
    };
}