import { ShortAgent } from "./agent";

export interface IncidentsResponse {
    message:   string;
    incidents: Incidence[];
}

export interface Incidence {
    _id:         string;
    title:       string;
    description: string;
    severity:    number;
    author:      ShortAgent;
    agent:       ShortAgent;
    createdAt:   Date;
    updatedAt:   Date;
}


export interface IncidentQueryParams {
    title: string;
    description: string;
    includesSeverity: boolean;
    severity: number;
    author: string;
    agent: string;
    startDate: string;
    endDate: string;
}



export interface IncidentEntry {
    title:       string;
    description: string;
    severity:    number;
    author:      string;
    agent:       string;
}