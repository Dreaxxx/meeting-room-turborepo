export function startOfDay(d: Date) {
    const x = new Date(d);
    x.setUTCHours(9, 0, 0, 0);
    return x;
}

export function endOfDay(d: Date) {
    const x = new Date(d);
    x.setUTCHours(18, 59, 59, 999);
    return x;
}

export function startOfWeekMonday(d: Date) {
    const x = startOfDay(d);           
    const dow = x.getUTCDay();      
    const diff = (dow === 0 ? -6 : 1 - dow);
    x.setUTCDate(x.getUTCDate() + diff); 
    return x;
}

export function endOfWeekFriday(d: Date) {
    const monday = startOfWeekMonday(d);
    const fri = new Date(monday);
    fri.setUTCDate(monday.getUTCDate() + 4);
    return endOfDay(fri);   
}

export function startOfMonth(d: Date) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 9, 0, 0, 0));
}

export function endOfMonth(d: Date) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 17, 59, 59, 999));
}
