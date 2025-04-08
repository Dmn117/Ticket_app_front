import {Component, Injectable} from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sweet-alert',
  templateUrl: './sweet-alert.component.html',
  styleUrls: ['./sweet-alert.component.scss']
})

@Injectable({
  providedIn: 'root'
})

export class SweetAlertComponent {

  // Método para mostrar una alerta de éxito
  showSuccessAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  }

  // Método para mostrar una alerta de error
  showErrorAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo'
    });
  }

  // Método para mostrar una alerta de advertencia
  showWarningAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    });
  }

  // Método para mostrar una alerta de información
  showInfoAlert(title: string, text: string) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  // Método para confirmar una acción
  async confirmAction(title: string, text: string): Promise<boolean> {
    const result = await Swal.fire({
      backdrop: true,
      allowEscapeKey: false,
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, proceder',
      cancelButtonText: 'Cancelar'
    });
    return result.isConfirmed;
  }
}
