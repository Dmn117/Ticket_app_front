import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  @Input() fields: any[] | undefined;
  @Input() form: FormGroup;
  @Output() submitForm = new EventEmitter<any>();

  showPassword: { [key: string]: boolean } = {};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    if (this.fields) {
      this.fields.forEach(field => {
        this.form.addControl(field.name, this.fb.control('', field.validators || []));
        if (field.type === 'password') {
          this.showPassword[field.name] = false;
        }
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitForm.emit(this.form.value);
    }
  }

  togglePasswordVisibility(fieldName: string) {
    this.showPassword[fieldName] = !this.showPassword[fieldName];
  }
}
