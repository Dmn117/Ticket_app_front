

export const dateType = {
    long: 'long',
    short: 'short',
}


const formatLocalDate = (date: string | Date | null, type: string): string => {
    if (!date) return '';

    let options = {};

    switch (type) {
        case dateType.long:
            options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
            };
            break;
        case dateType.short:
            options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            };
            break;
    }

    return new Date(date).toLocaleDateString('es-MX', options);
};



export default formatLocalDate;