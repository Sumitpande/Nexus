
export function formatMessageDate(input: Date | string | number | null): string {
    if (!input) {
        return ""
    }
    const date = new Date(input);
    const now = new Date();

    const isToday =
        date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (isToday) {
        return time;
    }

    if (isYesterday) {
        return `Yesterday, ${time}`;
    }

    const sameYear = date.getFullYear() === now.getFullYear();

    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        ...(sameYear ? {} : { year: 'numeric' }),
    }) + `, ${time}`;
}
