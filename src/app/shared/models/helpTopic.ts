export interface ResAllHelpTopic {
    message:    string;
    helpTopics: HelpTopic[];
}

export interface HelpTopic {
    _id:        string;
    name:       string;
    expIn:      number;
    tags:       string[];
    enabled:    boolean;
    department: string;
    createdAt:  Date;
    updatedAt:  Date;
    __v:        number;
}