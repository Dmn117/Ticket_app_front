import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/core/services/dialog.service';
import { UserStateService } from 'src/app/core/services/user-state.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss']
})
export class RecoverPasswordComponent {
  
  expirationCode: number = 0;
  addVerificationCode: boolean = false;
  
  loginFields = [
    { name: 'email', label: 'Email', type: 'email', validators: [Validators.required, Validators.email] },
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


  loginPage() {
    this.router.navigate(['/login']);
  };


  addVerificationCodeField() {
    if (this.addVerificationCode) return;

    const verificationField = {
      name: 'verificationCode',
      label: 'Código de Verificación',
      type: 'text',
      validators: [Validators.required]
    };

    const passwordField = {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      validators: [Validators.required]
    };

    const confirmPasswordField = {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      validators: [Validators.required]
    };

    this.loginFields.push(verificationField);
    this.loginFields.push(passwordField);
    this.loginFields.push(confirmPasswordField);

    this.form.addControl(
      verificationField.name,
      new FormControl('', verificationField.validators)
    );

    this.form.addControl(
      passwordField.name,
      new FormControl('', passwordField.validators)
    );

    this.form.addControl(
      confirmPasswordField.name,
      new FormControl('', confirmPasswordField.validators)
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


  recoverPassword = async (email: string, verificationCode: string, password: string): Promise<void> => {
    try {
      const res  = await firstValueFrom(
        this.authService.recoverPassword(email, { verificationCode, password })
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
      this.userStateService.setDepartments(response.user.departments);
      this.userStateService.setLoggedIn(true);

      this.router.navigate(['/home']);
    }
    catch (error) {
      console.log(error);
      if (!this.addVerificationCode)
        this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
    }
  };


  onLoginSubmit = async (formData: any): Promise<void> => {
    try {
      const { email, verificationCode, password, confirmPassword } = formData;

      if (!verificationCode || !password || !confirmPassword) {
        if (!this.addVerificationCode) {
          this.sendVerificationCode(email);
          this.addVerificationCodeField();
        }
        else {
          this.dialogService.openDialog(`Error: Por favor ingrese los campos obligatorios antes de continuar`);
        }

        return;
      }
        

      if (password !== confirmPassword) {
        this.dialogService.openDialog(`Error: Las contraseñas proporcionadas no coinciden`);
        return;
      }

      await this.recoverPassword(email, verificationCode, password);

      this.login(email, password);
    }
    catch (error) {
      console.log(error);
      this.dialogService.openDialog(`Error: ${(error as HttpErrorResponse).error.message}`);
    }
  };
}