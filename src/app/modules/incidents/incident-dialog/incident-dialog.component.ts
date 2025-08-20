import {Component, Inject, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

@Component({
  selector: 'app-incident-dialog',
  templateUrl: './incident-dialog.component.html',
  styleUrls: ['./incident-dialog.component.scss']
})


export class IncidentDialogComponent implements OnInit {

  constructor
  (
    @Inject(MAT_DIALOG_DATA) public data: any
  )
  {  }

  ngOnInit(): void {
    console.log('Incident data:', this.data);
  }

  getSeverityText(severity: any): string {
    if (!severity) return 'No especificada';
    
    const severityNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    if (severityNum >= 9) return 'Crítica (9-10)';
    if (severityNum >= 6) return 'Alta (6-8)';
    if (severityNum >= 3) return 'Media (3-5)';
    return 'Baja (1-2)';
  }

  getSeverityLevel(severity: any): string {
    if (!severity) return 'low';
    
    const severityNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    if (severityNum >= 9) return 'critical';
    if (severityNum >= 6) return 'high';
    if (severityNum >= 3) return 'medium';
    return 'low';
  }

  getSeverityIcon(severity: any): string {
    if (!severity) return 'info';
    
    const severityNum = typeof severity === 'string' ? parseInt(severity) : severity;
    
    if (severityNum >= 9) return 'warning';
    if (severityNum >= 6) return 'error';
    if (severityNum >= 3) return 'warning';
    return 'info';
  }

  getAuthorName(): string {
    if (this.data.author) {
      if (this.data.author.firstName && this.data.author.lastName) {
        return `${this.data.author.firstName} ${this.data.author.lastName}`;
      }
    }
    
    // Alternativas comunes en caso de que la estructura sea diferente
    if (this.data.createdBy) {
      if (typeof this.data.createdBy === 'string') return this.data.createdBy;
      if (this.data.createdBy.firstName && this.data.createdBy.lastName) {
        return `${this.data.createdBy.firstName} ${this.data.createdBy.lastName}`;
      }
    }
    
    if (this.data.user) {
      if (typeof this.data.user === 'string') return this.data.user;
      if (this.data.user.firstName && this.data.user.lastName) {
        return `${this.data.user.firstName} ${this.data.user.lastName}`;
      }
    }
    
    return 'No especificado';
  }

  getAgentName(): string {
    if (this.data.agent) {
      if (typeof this.data.agent === 'string') return this.data.agent;
      if (this.data.agent.firstName && this.data.agent.lastName) {
        return `${this.data.agent.firstName} ${this.data.agent.lastName}`;
      }
    }
    
    if (this.data.assignedTo) {
      if (typeof this.data.assignedTo === 'string') return this.data.assignedTo;
      if (this.data.assignedTo.firstName && this.data.assignedTo.lastName) {
        return `${this.data.assignedTo.firstName} ${this.data.assignedTo.lastName}`;
      }
    }
    
    return 'No asignado';
  }

  getFormattedDate(): string {
    const dateField = this.data.createdAt || this.data.createDate || this.data.date || this.data.timestamp;
    
    if (!dateField) return 'No especificada';
    
    try {
      const date = new Date(dateField);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

}
