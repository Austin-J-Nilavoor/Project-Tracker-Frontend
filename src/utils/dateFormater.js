/**
 * Formats a date string to "DD MMM" (e.g., "19 Nov")
 * Useful for timelines or tight spaces.
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDayMonth = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (error) {
        return dateString;
    }
};

/**
 * Formats a date string to "DD MMM YYYY" (e.g., "19 Nov 2025")
 * Standard display format.
 * @param {string|Date} dateString 
 * @returns {string}
 */
export const formatDateFull = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (error) {
        return dateString;
    }
};

const dateFormatter = {
    formatDayMonth,
    formatDateFull
};

export default dateFormatter;