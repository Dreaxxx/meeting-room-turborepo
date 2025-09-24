export function startOfDay(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
export function endOfDay(d: Date) { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; }
export function startOfWeekMonday(d: Date) {
    const x = startOfDay(d);
    const dow = x.getDay(); // 0=sunday ... 1=monday ... 6=saturday
    const diff = (dow === 0 ? -6 : 1 - dow);
    x.setDate(x.getDate() + diff);
    return x;
}
export function endOfWeekFriday(d: Date) {
    const monday = startOfWeekMonday(d);
    const fri = new Date(monday);
    fri.setDate(monday.getDate() + 4); // monday + 4 = friday because we dont want meeting on weekend lmao
    return endOfDay(fri);
}
export function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0); }
export function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }