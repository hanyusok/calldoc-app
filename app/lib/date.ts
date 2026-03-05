export const KST_OFFSET = 9 * 60; // 9 hours in minutes

/**
 * Returns the current time in KST
 */
export function getKSTDate(): Date {
    return toKST(new Date());
}

/**
 * Converts a Date object to KST Date object (shifting time)
 * Note: This creates a Date object where the "local" time components match KST.
 * Be careful when using this with methods that use local timezone.
 */
export function toKST(date: Date): Date {
    // KST is UTC+9, so add 9 hours to UTC time
    return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}

/**
 * Formats a Date to YYYY-MM-DD string in KST
 */
export function formatKSTDate(date: Date): string {
    const kstDate = toKST(date);
    const year = kstDate.getUTCFullYear();
    const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(kstDate.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Constructs a UTC Date object from a KST Date string and Time string.
 * Example: dateStr="2026-02-15", timeStr="14:30" (KST)
 * Returns: Date object representing 2026-02-14 05:30:00 UTC (14:30 KST = 05:30 UTC)
 */
export function createKSTDate(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);

    // KST is UTC+9, so to convert KST to UTC, subtract 9 hours
    // Date.UTC handles month overflow correctly
    return new Date(Date.UTC(year, month - 1, day, hours - 9, minutes, 0));
}

/**
 * Gets the start and end of a KST day in UTC
 * Used for querying database for records within a specific KST day
 */
export function getKSTDayRangeInUTC(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);

    // Start of day KST (00:00:00) -> UTC (-9 hours)
    // Example: 2026-02-15 00:00:00 KST -> 2026-02-14 15:00:00 UTC
    const start = new Date(Date.UTC(year, month - 1, day, 0 - 9, 0, 0));

    // End of day KST (23:59:59.999) -> UTC (-9 hours)
    const end = new Date(Date.UTC(year, month - 1, day, 23 - 9, 59, 59, 999));

    return { start, end };
}

/**
 * Converts a UTC Date from DB to KST Time string (HH:mm)
 */
export function formatKSTTime(date: Date): string {
    // Convert UTC to KST by adding 9 hours, then extract time components
    const kstTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
    const h = kstTime.getUTCHours();
    const m = kstTime.getUTCMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
