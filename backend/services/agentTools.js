import pool from '../config/db.js';

// ─── EARNINGS SUMMARY ──────────────────────────────────────
// Returns total earnings + per-platform breakdown for a date range
export const getEarningsSummary = async (userId, startDate, endDate) => {
    console.log('[getEarningsSummary] called with:', { userId, startDate, endDate });
    const [[earningsRow]] = await pool.query(
        `SELECT COALESCE(SUM(gross_amount), 0) AS total_earnings
     FROM earnings
     WHERE user_id = ? AND date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
    );

    const [platformRows] = await pool.query(
        `SELECT 
      p.id, p.name, p.color, p.type,
      COALESCE(SUM(e.gross_amount), 0) AS total,
      COUNT(e.id) AS trips,
      COALESCE(SUM(e.hours_worked), 0) AS hours
     FROM earnings e
     INNER JOIN platforms p ON e.platform_id = p.id
     WHERE e.user_id = ? AND e.date BETWEEN ? AND ?
     GROUP BY p.id, p.name, p.color, p.type
     ORDER BY total DESC`,
        [userId, startDate, endDate]
    );

    console.log('[getEarningsSummary] raw result:', earningsRow, platformRows);

    return {
        startDate,
        endDate,
        totalEarnings: Number(earningsRow.total_earnings),
        platforms: platformRows.map((p) => ({
            name: p.name,
            type: p.type,
            total: Number(p.total),
            trips: Number(p.trips),
            hours: Number(p.hours),
        })),
    };
};

// ─── FUEL SUMMARY ──────────────────────────────────────────
// Returns total fuel spend for a date range
export const getFuelSummary = async (userId, startDate, endDate) => {
    const [[fuelRow]] = await pool.query(
        `SELECT COALESCE(SUM(amount), 0) AS total_fuel, COUNT(*) AS log_count
     FROM fuel_logs
     WHERE user_id = ? AND date BETWEEN ? AND ?`,
        [userId, startDate, endDate]
    );

    return {
        startDate,
        endDate,
        totalFuel: Number(fuelRow.total_fuel),
        logCount: Number(fuelRow.log_count),
    };
};

// ─── NET PROFIT ─────────────────────────────────────────────
// Combines earnings + fuel to compute net profit for a date range
export const getNetProfit = async (userId, startDate, endDate) => {
    const earnings = await getEarningsSummary(userId, startDate, endDate);
    const fuel = await getFuelSummary(userId, startDate, endDate);

    const netProfit = earnings.totalEarnings - fuel.totalFuel;

    return {
        startDate,
        endDate,
        totalEarnings: earnings.totalEarnings,
        totalFuel: fuel.totalFuel,
        netProfit,
    };
};

// ─── RESOLVE DATE RANGE ──────────────────────────────────────
// Converts a natural-language-ish period keyword into concrete ISO dates.
// Keeps calendar math out of the LLM's hands — it just picks the closest keyword.
export const resolveDateRange = (period) => {
    const today = new Date();
    const toISO = (d) => d.toISOString().split('T')[0];

    let startDate, endDate;

    switch (period) {
        case 'today': {
            startDate = toISO(today);
            endDate = startDate;
            break;
        }
        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            startDate = toISO(yesterday);
            endDate = startDate;
            break;
        }
        case 'this_week': {
            const day = today.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            const monday = new Date(today);
            monday.setDate(today.getDate() + diffToMonday);
            startDate = toISO(monday);
            endDate = toISO(today);
            break;
        }
        case 'last_week': {
            const day = today.getDay();
            const diffToMonday = day === 0 ? -6 : 1 - day;
            const thisMonday = new Date(today);
            thisMonday.setDate(today.getDate() + diffToMonday);

            const lastMonday = new Date(thisMonday);
            lastMonday.setDate(thisMonday.getDate() - 7);

            const lastSunday = new Date(thisMonday);
            lastSunday.setDate(thisMonday.getDate() - 1);

            startDate = toISO(lastMonday);
            endDate = toISO(lastSunday);
            break;
        }
        case 'this_month': {
            startDate = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
            endDate = toISO(today);
            break;
        }
        case 'last_month': {
            const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDayOfLastMonth = new Date(firstOfThisMonth);
            lastDayOfLastMonth.setDate(firstOfThisMonth.getDate() - 1);
            const firstOfLastMonth = new Date(
                lastDayOfLastMonth.getFullYear(),
                lastDayOfLastMonth.getMonth(),
                1
            );
            startDate = toISO(firstOfLastMonth);
            endDate = toISO(lastDayOfLastMonth);
            break;
        }
        default: {
            // Fallback: default to "this_month" if the LLM sends an unrecognized keyword
            startDate = toISO(new Date(today.getFullYear(), today.getMonth(), 1));
            endDate = toISO(today);
            break;
        }
    }

    return { period, startDate, endDate };
};

