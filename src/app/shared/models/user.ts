export interface ResAllUsers {
    message: string;
    users:   User[];
}

export interface User {
    _id:              string;
    firstName:        string;
    lastName:         string;
    email:            string;
    role:             string;
    rating:           number;
    evaluatedTickets: number;
    closedTickets:    number;
    reporter:         boolean;
    validated:        boolean;
    enabled:          boolean;
    avatar:           string;
    boss:             string;
    departments:      string[];
    createdAt:        Date;
    updatedAt:        Date;
}




export interface RecoverPassword {
    verificationCode: string;
    password: string;
}



export interface UserQueryParams {
    firstName:              string;
    lastName:               string;
    email:                  string;
    includesRoles:          boolean;
    role:                   string;
    reporter:               boolean;
    validated:              boolean;
    enabled:                boolean;
    boss:                   string;
    includesDepartments:    boolean
    departments:            string[];
    ratingLte:              number;
    ratingGte:              number;
}