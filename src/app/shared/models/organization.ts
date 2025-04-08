import { User } from "./user";

export interface ResAllOrganization {
  message:       string;
  organizations: Organization[];
}

export interface Organization {
  _id:       string;
  name:      string;
  enabled:   boolean;
  director:  User;
  createdAt: Date;
  updatedAt: Date;
}