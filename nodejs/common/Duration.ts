/**
 * ISO 8601 Duration Implementation
 *
 * A relative duration, which contains months, days, and nanoseconds.
 * Can be used for calendar-relative durations (e.g., 7 days forward), or for absolute durations
 * using the nanosecond component.
 */

const MONTHS_IN_YEAR = 12;
const DAYS_IN_WEEK = 7;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const NANOS_IN_SECOND = 1_000_000_000;

export class Duration {
    private readonly _months: number;
    private readonly _days: number;
    private readonly _nanos: number;

    /**
     * Creates a new Duration instance
     *
     * @param months The months part of the duration
     * @param days The days part of the duration
     * @param nanos The nanoseconds part of the duration
     */
    constructor(months: number, days: number, nanos: number) {
        this._months = months;
        this._days = days;
        this._nanos = nanos;
    }

    /**
     * The months part of the duration
     */
    get months(): number {
        return this._months;
    }

    /**
     * The days part of the duration
     */
    get days(): number {
        return this._days;
    }

    /**
     * The nanoseconds part of the duration
     */
    get nanos(): number {
        return this._nanos;
    }

    /**
     * Parses a Duration object from a string in ISO 8601 format.
     *
     * @param durationStr A string representation of the duration. Expected format: PnYnMnDTnHnMnS / PnW
     * @returns A Duration object.
     * @throws Error If durationStr is of an incorrect format.
     *
     * @example
     * Duration.fromString("P1Y10M7DT15H44M5.00394892S")
     * Duration.fromString("P55W")
     */
    static fromString(durationStr: string): Duration {
        // Regular expression for datetime format (PnYnMnDTnHnMnS)
        const datetimeRegex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)(?:\.(\d+))?S)?)?$/;
        // Regular expression for week format (PnW)
        const weekRegex = /^P(\d+)W$/;

        const datetimeMatch = durationStr.match(datetimeRegex);
        if (datetimeMatch) {
            if (durationStr.includes('T') &&
                !datetimeMatch[4] && !datetimeMatch[5] && !datetimeMatch[6]) {
                throw new Error(`Incorrect format for duration string: '${durationStr}'. T present but no time components.`);
            }

            const years = parseInt(datetimeMatch[1] || '0', 10);
            const months = parseInt(datetimeMatch[2] || '0', 10);
            const days = parseInt(datetimeMatch[3] || '0', 10);
            const hours = parseInt(datetimeMatch[4] || '0', 10);
            const minutes = parseInt(datetimeMatch[5] || '0', 10);
            const seconds = parseInt(datetimeMatch[6] || '0', 10);

            let nanosStr = (datetimeMatch[7] || '0').padEnd(9, '0').substring(0, 9);
            const nanos = parseInt(nanosStr, 10);

            const totalMonths = months + years * MONTHS_IN_YEAR;
            const totalMinutes = minutes + hours * MINUTES_IN_HOUR;
            const totalSeconds = seconds + totalMinutes * SECONDS_IN_MINUTE;
            const totalNanos = nanos + totalSeconds * NANOS_IN_SECOND;
            return new Duration(totalMonths, days, totalNanos);
        }

        const weekMatch = durationStr.match(weekRegex);
        if (weekMatch) {
            const weeks = parseInt(weekMatch[1] || '0', 10);
            return new Duration(0, weeks * DAYS_IN_WEEK, 0);
        }

        throw new Error(`Incorrect format for duration string: '${durationStr}'`);
    }

    /**
     * Returns a string representation of the duration.
     */
    toString(): string {
        return `months: ${this.months}, days: ${this.days}, nanos: ${this.nanos}`;
    }

    /**
     * Checks if this duration is equal to another duration.
     *
     * @param other The other duration to compare with
     */
    equals(other: any): boolean {
        if (this === other) {
            return true;
        }
        if (other === null || !(other instanceof Duration)) {
            return false;
        }
        return this.months === other.months &&
            this.days === other.days &&
            this.nanos === other.nanos;
    }
}
