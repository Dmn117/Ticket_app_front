import { Department } from "./department";
import { HelpTopic } from "./helpTopic";
import { User } from "./user";

export interface Tickets {
    _id:         string;
    title:       string;
    description: string;
    number:      number;
    status:      string;
    rating:      number;
    comment:     string;
    owner:       string;
    assignedTo:  string;
    department:  string;
    helpTopic:   string;
    messages:    string[];
    files:       string;
    transfers:   string[];
    assignedAt:  Date;
    answeredAt:  Date;
    completedAt: Date;
    createdAt:   Date;
    updatedAt:   Date;
}

export interface Ticket {
    _id:         string;
    title:       string;
    description: string;
    status:      string;
    rating:      null;
    comment:     string;
    owner:       User;
    assignedTo:  User;
    department:  Department;
    helpTopic:   HelpTopic;
    messages:    Message[];
    files:       any[];
    transfers:   string[];
    assignedAt:  null;
    answeredAt:  null;
    completedAt: null;
    createdAt:   Date;
    updatedAt:   Date;
    __v:         number;
    number:      number;
}

export interface Message {
    _id:            string;
    text:           string;
    visibility:     string;
    isEdited:       boolean;
    previousTexts:  string[];
    attachment:     Attachment;
    attachmentType: string;
    owner:          MessageOwner;
    createdAt:      Date;
    updatedAt:      Date;
    __v:            number;
}

export interface MessageOwner {
    _id:       string;
    firstName: string;
    lastName:  string;
    role:      string;
    avatar:    string;
}


export interface Attachment {
    _id: string;
    originalName: string;
}


export interface AddItem {
    message:    string;
    file:       string;
    department: string;
    transfer:   string;
    assignedTo: string;
    helpTopic:  string;
}


export interface UpdateTicket {
    title:       string;
    description: string;
    status:      string;
    justification:  string;
}


export interface RateTicket {
    rating: number,
    comment: string
}
