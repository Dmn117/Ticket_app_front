export interface MessageCreate {
    text:           string;
    owner:          string;
    attachment:     string;
    attachmentType: string;
}

export interface MessageUpdate {
    text:           string;
    visibility:     string;
    attachment:     string;
    attachmentType: string;
}



export interface ResMessageCreate {
    resMessage: string;
    message:    MessageCreate;
}

export interface MessageCreate {
    _id:            string;
    text:           string;
    visibility:     string;
    isEdited:       boolean;
    previousTexts:  string[];
    attachment:     string;
    attachmentType: string;
    owner:          string;
    createdAt:      Date;
    updatedAt:      Date;
}