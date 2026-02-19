export const KST_OFFSET = 9 * 60; // 9 hours in minutes

/**
 * Returns the current time in KST
 */
export function getKSTDate(): Date {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 9));
}

/**
 * Converts a Date object to KST Date object (shifting time)
 * Note: This creates a Date object where the "local" time components match KST.
 * Be careful when using this with methods that use local timezone.
 */
export function toKST(date: Date): Date {
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 9));
}

/**
 * Formats a Date to YYYY-MM-DD string in KST
 */
export function formatKSTDate(date: Date): string {
    const kstDate = toKST(date);
    const year = kstDate.getFullYear();
    const month = String(kstDate.getMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Constructs a UTC Date object from a KST Date string and Time string.
 * Example: dateStr="2026-02-15", timeStr="14:30" (KST)
 * Returns: Date object representing 2026-02-15 05:30:00 UTC
 */
export function createKSTDate(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create a date object in UTC with the KST time components
    // Then subtract 9 hours to get the actual UTC time
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
    date.setHours(date.getHours() - 9);

    return date;
}

/**
 * Gets the start and end of a KST day in UTC
 * Used for querying database for records within a specific KST day
 */
export function getKSTDayRangeInUTC(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);

    // Start of day KST (00:00:00) -> UTC (-9 hours)
    // Example: 2026-02-15 00:00:00 KST -> 2026-02-14 15:00:00 UTC
    const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    start.setHours(start.getHours() - 9);

    // End of day KST (23:59:59.999) -> UTC (-9 hours)
    const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    end.setHours(end.getHours() - 9);

    return { start, end };
}

/**
 * Converts a UTC Date from DB to KST Time string (HH:mm)
 */
export function formatKSTTime(date: Date): string {
    const kstDate = toKST(date);
    const hours = String(kstDate.getUTCHours()).padStart(2, '0'); // using utc methods on shifted date gives correct "local" components if we consider it utc-anchored
    // Actually, toKST shifts the epoch. 
    // Let's rely on explicit calculation for safety or use toLocaleString if environment supports it reliably.
    // Better approach manually:
    const kst = new Date(date.getTime() + (3600000 * 9));
    const h = kst.getUTCHours();
    const m = kst.getUTCMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
