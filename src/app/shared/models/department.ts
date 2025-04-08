export interface ResAllDepartments {
  message:     string;
  departments: Department[];
}

export interface Department {
  _id:          string;
  name:         string;
  enabled:      boolean;
  organization: string;
  owner:        string;
  createdAt:    Date;
  updatedAt:    Date;
  __v:          number;
  expIn: string | number;
}


export interface Department {
  _id:           string;
  name:          string;
  enabled:       boolean;
  organization:  string;
  owner:         string;
  createdAt:     Date;
  updatedAt:     Date;
  __v:           number;
  tags?:         string[];
  department?:   string;
  expIn: string | number;
}


export interface DepartmentWithOrganization {
  _id:          string;
  name:         string;
  enabled:      boolean;
  organization: Organization;
  owner:        string;
  createdAt:    Date;
  updatedAt:    Date;
  __v:          number;
}


export interface Organization {
  _id:  string;
  name: string;
}
