import { BehaviorSubject } from "rxjs";
import { Injectable } from "@angular/core";


@Injectable({
     providedIn: 'root'
})
export class SocketStateService {
    private initialState = JSON.parse(localStorage.getItem('socketConnected') || 'false');
    private subjectState = new BehaviorSubject<boolean>(this.initialState);

    state$ = this.subjectState.asObservable();

    setState = (value: boolean): void => {
        this.subjectState.next(value);
        localStorage.setItem('socketConnected', JSON.stringify(value));
    };
}