import { intervalToDuration } from "date-fns";


export const SecondsToString = (secs: number): string => {
    const time: string[] = [];
    const current: Date = new Date();
    const future: Date = new Date(current.getTime() + secs * 1000);

    const duration = intervalToDuration({ start: current, end: future});

    duration.years && time.push(`${duration.years} ${duration.years > 1 ? 'años' : 'año'}`);
    duration.months && time.push(`${duration.months} ${duration.months > 1 ? 'meses' : 'mes'}`);
    duration.days && time.push(`${duration.days} ${duration.days > 1 ? 'días' : 'día'}`);
    duration.hours && time.push(`${duration.hours} ${duration.hours > 1 ? 'horas' : 'hora'}`);
    duration.minutes && time.push(`${duration.minutes} ${duration.minutes > 1 ? 'minutos' : 'minuto'}`);
    duration.seconds && time.push(`${duration.seconds} ${duration.seconds > 1 ? 'segundos' : 'segundo'}`);

    return time.join(', ');
}; 


export const MinutesToString = (mins: number): string => {
    return SecondsToString(mins * 60)
}; 



export default MinutesToString;