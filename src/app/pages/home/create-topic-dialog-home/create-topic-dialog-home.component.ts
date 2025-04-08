import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Department } from "../../../shared/models/department";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import { MatLegacyChipInputEvent } from "@angular/material/legacy-chips";
import {DialogService} from "../../../core/services/dialog.service";
import {SweetAlertComponent} from "../../../shared/components/sweet-alert/sweet-alert.component";
import {DepartmentService} from "../../../core/services/department.service";
import {HelpTopicsService} from "../../../core/services/help-topic.service";

@Component({
  selector: 'app-create-topic-dialog-home',
  templateUrl: './create-topic-dialog-home.component.html',
  styleUrls: ['./create-topic-dialog-home.component.scss']
})
export class CreateTopicDialogHomeComponent {
  topicForm: FormGroup;
  departments: Department[] = [];
  tags: string[] = [];
  tagsControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTopicDialogHomeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { departments: Department[] }
  ) {
    this.topicForm = this.fb.group({
      name: ['', Validators.required],
      department: ['', Validators.required],
    });

    this.departments = this.data.departments;
  }

  addTag(event: MatLegacyChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
    this.tagsControl.setValue(null);
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onCreate(): void {
    if (this.topicForm.valid) {
      const formData = this.topicForm.value;
      const payload = {
        name: formData.name,
        tags: this.tags,
        department: formData.department,
      };
      this.dialogRef.close(payload);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }



}
