import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DepartmentService } from "../../../core/services/department.service";
import { OrganizationService } from "../../../core/services/organization.service";
import { MatLegacyChipInputEvent } from "@angular/material/legacy-chips";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {Department} from "../../../shared/models/department";
import {Organization} from "../../../shared/models/organization";

@Component({
  selector: 'app-edit-topic-dialog',
  templateUrl: './edit-topic-dialog.component.html',
  styleUrls: ['./edit-topic-dialog.component.scss']
})
export class EditTopicDialogComponent implements OnInit {
  topicForm: FormGroup;
  organizations: Organization[] = [];
  departments: Department[] = [];
  tags: string[] = [];
  tagsControl = new FormControl();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  hours: number = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditTopicDialogComponent>,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.topicForm = this.fb.group({
      name: [data.name, Validators.required],
      organization: [null, Validators.required],
      department: [data.department, Validators.required],
      expIn: [data.expIn, [Validators.min(0),Validators.required, Validators.pattern("^[0-9]*$")]],
    });
    this.tags = data.tags || [];
  }

  ngOnInit(): void {
     this.organizationService.getOrganizationsEnabled().subscribe(response => {
      // @ts-ignore
      this.organizations = response.organizations || [];
      console.log(this.data)
    });

    this.loadOrganizationForDepartment(this.data.department);
  }

  loadOrganizationForDepartment(departmentId: string): void {
    this.departmentService.getDepartmentById(departmentId).subscribe(response => {
      const department = response.department;

      if (department && department.organization) {
        this.topicForm.get('organization')?.setValue(department.organization);
        this.loadDepartments(department.organization);
      }
    });
  }

  loadDepartments(organizationId: string): void {
    this.departmentService.getDepartmentsEnabled().subscribe(response => {
      // @ts-ignore
      this.departments = response.departments.filter(dept => dept.organization === organizationId);
      this.topicForm.get('department')?.setValue(this.data.department);
    });
  }

  onOrganizationChange(organizationId: string): void {
    this.loadDepartments(organizationId);
    this.topicForm.get('department')?.reset();
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
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onUpdate(): void {
    if (this.topicForm.valid) {
      const updatedData = {
        ...this.topicForm.value,
        tags: this.tags
      };
      this.dialogRef.close(updatedData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  calculateHours(event: Event): void {
    const input = event.target as HTMLInputElement;
    const minutes = parseInt(input.value, 10);
    if (!isNaN(minutes)) {
      this.hours = Math.floor(minutes / 60);
    } else {
      this.hours = 0;
    }
  }

  preventDecimal(event: KeyboardEvent): void {
    if (event.key === '.' || event.key === ',') {
      event.preventDefault();
    }
  }
}
