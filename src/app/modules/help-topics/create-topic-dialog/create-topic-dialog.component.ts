import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DepartmentService } from "../../../core/services/department.service";
import { OrganizationService } from "../../../core/services/organization.service";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatLegacyChipInputEvent } from "@angular/material/legacy-chips";
import { Department } from "../../../shared/models/department";
import { Organization } from "../../../shared/models/organization";
import MinutesToString from 'src/app/shared/lib/MinutesToString';

@Component({
  selector: 'app-create-topic-dialog',
  templateUrl: './create-topic-dialog.component.html',
  styleUrls: ['./create-topic-dialog.component.scss']
})
export class CreateTopicDialogComponent implements OnInit {
  topicForm: FormGroup;
  organizations: Organization[] = [];
  departments: Department[] = [];
  tags: string[] = [];
  tagsControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  hours: number = 0;

  minutes2String = MinutesToString;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateTopicDialogComponent>,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.topicForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(5)]],
      organization: ['', Validators.required],
      department: ['', Validators.required],
      expIn: ['', [Validators.min(0),Validators.required, Validators.pattern("^[0-9]*$")]],
      example: ['', Validators.required],
      example2: ['', Validators.required],
      example3: [''],
      example4: [''],
      example5: [''],
    });
  }

  ngOnInit(): void {
    this.organizationService.getOrganizationsEnabled().subscribe(response => {
      // @ts-ignore
      this.organizations = response.organizations || [];
    });
  }

  onOrganizationChange(organizationId: string): void {
    if (organizationId) {
      this.departmentService.getDepartmentsEnabled().subscribe(response => {
        // @ts-ignore
        this.departments = response.departments?.filter(dept => dept.organization === organizationId) || [];
      });
      this.topicForm.get('department')?.reset();
    }
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

      const examples = [];

      if (formData.example) examples.push(formData.example);
      if (formData.example2) examples.push(formData.example2);
      if (formData.example3) examples.push(formData.example3);
      if (formData.example4) examples.push(formData.example4);
      if (formData.example5) examples.push(formData.example5);

      const payload = {
        name: formData.name,
        tags: this.tags,
        department: formData.department,
        expIn: formData.expIn,
        examples,
      };
      this.dialogRef.close(payload);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  preventDecimal(event: KeyboardEvent): void {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }


}
