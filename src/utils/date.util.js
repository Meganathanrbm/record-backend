function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

exports.getStartAndEndDate = (dateString) => {
    const date = new Date(dateString);

    // This week's starting date
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Set to Sunday of this week

    // This week's ending date
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Set to Saturday of this week

    // This month's starting date
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);

    // This month's ending date
    const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const monthEnd = new Date(nextMonthStart);
    monthEnd.setDate(nextMonthStart.getDate() - 1); // Set to last day of this month

    // This year's starting date
    const yearStart = new Date(date.getFullYear(), 0, 1);

    // This year's ending date
    const yearEnd = new Date(date.getFullYear() + 1, 0, 0);

    return {
        weekStart: formatDate(weekStart),
        weekEnd: formatDate(weekEnd),
        monthStart: formatDate(monthStart),
        monthEnd: formatDate(monthEnd),
        yearStart: formatDate(yearStart),
        yearEnd: formatDate(yearEnd),
    };
};
