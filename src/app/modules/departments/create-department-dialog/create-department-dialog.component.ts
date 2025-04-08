import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-department-dialog',
  templateUrl: './create-department-dialog.component.html',
  styleUrls: ['./create-department-dialog.component.scss']
})
export class CreateDepartmentDialogComponent implements OnInit {
  departmentForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<CreateDepartmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.createForm();
   }

  createForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      organization: ['', Validators.required],
      owner: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.departmentForm.valid) {
      this.dialogRef.close(this.departmentForm.value);
    }
  }

  isFormComplete(): boolean {
    return this.departmentForm.valid;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
