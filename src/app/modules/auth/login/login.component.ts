import { Component } from '@angular/core';
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, firstValueFrom, of } from 'rxjs';
import {DialogService} from "../../../core/services/dialog.service";
import { HttpErrorResponse } from '@angular/common/http';
import { SocketWebService } from 'src/app/core/services/socket-web.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  
  expirationCode: number = 0;
  addVerificationCode: boolean = false;
  
  loginFields = [
    { name: 'email', label: 'Email', type: 'email', validators: [Validators.required, Validators.email] },
    { name: 'password', label: 'Contraseña', type: 'password', validators: [Validators.required] }
  ];

  form: FormGroup; // Declarar el FormGroup

  constructor(private fb: FormBuilder,
              private router: Router,
              private authService: AuthService,
              private dialogService: DialogService,
              private userStateService: UserStateService,
            ) {
    this.userStateService.expirationCode$.subscribe(expirationCode => this.expirationCode = expirationCode);
    this.form = this.fb.group({}); // Inicializar el FormGroup
    this.initializeForm(); // Llamar al método para inicializar el formulario
  }

  initializeForm() {
    // Agregar controles al FormGroup según los campos
    this.loginFields.forEach(field => {
      this.form.addControl(field.name, this.fb.control('', field.validators || []));
    });
  };


  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.router.navigate(['/home']);
    }
  };


  recoverPassword() {
    this.router.navigate(['/recover-password'])
  };


  addVerificationCodeField() {
    if (this.addVerificationCode) return;

    const verificationField = {
      name: 'verificationCode',
      label: 'Código de Verificación',
      type: 'text',
      validators: [Validators.required]
    };

    this.loginFields.push(verificationField);

    this.form.addControl(
      verificationField.name,
      new FormControl('', verificationField.validators)
    );

    this.addVerificationCode = true;
  };


  sendVerificationCode = async (email: string): Promise<void> => {
    try {
      if (Date.now() < this.expirationCode) return;

      await firstValueFrom(
        this.authService.sendVerificationCode(email)
      );

      this.userStateService.setExpirationCode(Date.now() + 5 * 60 * 1000);

      this.dialogService.openDialog(`Info: Se ha enviado un nuevo código de verificación a su correo`);
    }
    catch (error) {
      console.log(error);
      this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
    }
  };


  validateVerificationCode = async (email: string, verificationCode: string): Promise<void> => {
    try {
      const res = await firstValueFrom(
        this.authService.validateVerificationCode(email, verificationCode)
      );

      if (res) {
        this.addVerificationCode = false;
        this.userStateService.setExpirationCode(0);
      }
    }
    catch (error) {
      console.log(error);
      this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
      (error as HttpErrorResponse).status === 410 && this.sendVerificationCode(email);
    }
  };


  login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await firstValueFrom(
        this.authService.login(email, password)
      );
      
      this.userStateService.setId(response.user._id);
      this.userStateService.setToken(response.token);
      this.userStateService.setRole(response.user.role);
      this.userStateService.setSpecialPermissions(response.user.specialPermissions);
      this.userStateService.setDepartments(response.user.departments);
      this.userStateService.setLoggedIn(true);

      this.router.navigate(['/home']);
    }
    catch (error) {
      console.log(error);

      if (!this.addVerificationCode)
        this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
      
      if ((error as HttpErrorResponse).status === 423)
        this.addVerificationCodeField();
    }
  };


  onLoginSubmit = async (formData: any): Promise<void> => {
    try {
      const { email, password, verificationCode } = formData;

      if (!verificationCode && this.addVerificationCode)
        this.dialogService.openDialog(`Error: Por favor ingrese su código de verificación antes de continuar`);

      verificationCode && await this.validateVerificationCode(email, verificationCode);

      this.login(email, password);
    }
    catch (error) {
      console.log(error);
      this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
    }
  };
}
