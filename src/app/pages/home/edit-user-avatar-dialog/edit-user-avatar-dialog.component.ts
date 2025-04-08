import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileService } from '../../../core/services/file.service';
import { SweetAlertComponent } from "../../../shared/components/sweet-alert/sweet-alert.component";
import {environment} from "../../../../environments/environment.development";
import {UserServiceService} from "../../../core/services/user-service.service";
import {AuthService} from "../../../core/services/auth.service";

@Component({
  selector: 'app-edit-user-avatar-dialog',
  templateUrl: './edit-user-avatar-dialog.component.html',
  styleUrls: ['./edit-user-avatar-dialog.component.scss']
})
export class EditUserAvatarDialogComponent {
  file!: File;
  avatarName: string | null = null;

  imgAvatar: string = '';
  private apiUrl = `${environment.apiUrl}/file/get/public/file`;

  constructor(
    private dialogRef: MatDialogRef<EditUserAvatarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fileService: FileService,
    private sweetAlert: SweetAlertComponent,
    private userService : UserServiceService,
    private authService: AuthService
  ) {
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    this.avatarName = this.file ? this.file.name : null;
  }

  async confirmUpdate() {
    const isConfirmed = await this.sweetAlert.confirmAction('¿Estás seguro?', '¿Quieres guardar el nuevo avatar?');
    if (isConfirmed) {
      if (!this.data.user._id) {
        console.error('ID no proporcionado para la actualización del avatar');
        return;
      }

      const avatarId = this.data.user.avatar;

      if (avatarId !== null){
        this.fileService.updateFile(avatarId, this.data.user._id, this.file).subscribe(
          response => {
            console.log('Avatar actualizado', response);

            this.data.user.avatar = response.file._id;
            this.imgAvatar = `${this.apiUrl}/${this.data.user.avatar}?t=${new Date().getTime()}`;

            this.userService.setAvatarUrl(this.imgAvatar);

            this.dialogRef.close({ newAvatarUrl: this.imgAvatar });
          },
          error => {
            console.error('Error al actualizar el avatar', error);
          }
        );
      } else {

        const updateAvatarUser = {
          avatar: ''
        }

        this.fileService.createAvatarFile(this.data.user._id, this.data.user._id, this.file).subscribe(
          response => {
            console.log('Avatar actualizado', response);

            updateAvatarUser.avatar = response.file._id;

            this.authService.updateUser(this.data.user._id, updateAvatarUser).subscribe(
              result => {
                console.log('Usuario actualizado', result);

                this.data.user.avatar = response.file._id;
                this.imgAvatar = `${this.apiUrl}/${this.data.user.avatar}?t=${new Date().getTime()}`;

                this.userService.setAvatarUrl(this.imgAvatar);

                this.dialogRef.close({ newAvatarUrl: this.imgAvatar })
              },
              error => {
                console.error('Error al actualizar al usuario', error);
              }
            )

          },
          error => {
            console.error('Error al crear el avatar', error);
          }
        )

      }




    }
  }



  close() {
    this.dialogRef.close();
  }

}
