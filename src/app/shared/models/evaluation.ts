import { ShortAgent } from "./agent";


export interface EvaluationQueryParams {
    includesRate: boolean;
    rate: string;
    comments: string;
    rated: boolean;
    includesAgent: boolean;
    agent: string;
    evaluator: string;
    boss: string;
}


export interface EvaluationEntry {
    rate: number;
    comments: string;
    rated: boolean;
    agent: string;
    evaluator: string;
}


export interface CreateEvaluationsInBulk {
    month: number;
    year: number;
}


export interface EvaluationsResponse {
    message:     string;
    evaluations: Evaluation[];
}


export interface EvaluationResponse {
    message:     string;
    evaluations: Evaluation;
}


export interface Evaluation {
    _id:       string;
    rate:      number;
    comments:  string;
    rated:     boolean;
    month:     number;
    year:      number;
    agent:     ShortAgent;
    evaluator: ShortAgent;
    createdAt: Date;
    updatedAt: Date;
    __v:       number;
}

export interface EvaluationRating {
    name: string;
    icon: string;
    rate: number;
}