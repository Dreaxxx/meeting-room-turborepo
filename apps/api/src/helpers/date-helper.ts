export type DateRange = { from: Date; to: Date };

export function startOfDay(day: Date) {
    const x = new Date(day);
    x.setUTCHours(9, 0, 0, 0);
    return x;
}

export function endOfDay(day: Date) {
    const x = new Date(day);
    x.setUTCHours(18, 59, 59, 999);
    return x;
}

export function startOfWeekMonday(day: Date) {
    const x = startOfDay(day);
    const dow = x.getUTCDay();
    const diff = (dow === 0 ? -6 : 1 - dow);
    x.setUTCDate(x.getUTCDate() + diff);
    return x;
}

export function endOfWeekFriday(day: Date) {
    const monday = startOfWeekMonday(day);
    const fri = new Date(monday);
    fri.setUTCDate(monday.getUTCDate() + 4);
    return endOfDay(fri);
}

export function startOfMonth(day: Date) {
    return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), 1, 9, 0, 0, 0));
}

export function endOfMonth(day: Date) {
    return new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0, 17, 59, 59, 999));
}
