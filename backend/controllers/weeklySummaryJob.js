import cron from 'node-cron';
import pool from '../config/db.js';
import { createNotification } from '../models/notificationModel.js';
import { sendPushNotification } from '../utils/sendPush.js';

const runWeeklySummary = async () => {
    console.log('Running weekly summary job...');

    const [users] = await pool.query(`SELECT id FROM users`);

    for (const user of users) {
        try {
            const [[earningsRow]] = await pool.query(
                `SELECT COALESCE(SUM(gross_amount), 0) AS total_earnings, COUNT(*) AS total_rides
         FROM earnings
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
                [user.id]
            );

            const [[fuelRow]] = await pool.query(
                `SELECT COALESCE(SUM(amount), 0) AS total_fuel
         FROM fuel_logs
         WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
                [user.id]
            );

            const totalEarnings = Number(earningsRow.total_earnings);
            const totalRides = Number(earningsRow.total_rides);
            const totalFuel = Number(fuelRow.total_fuel);
            const netProfit = totalEarnings - totalFuel;

            if (totalRides === 0) continue;

            const message = `This week: Rs. ${totalEarnings} earned from ${totalRides} rides, Rs. ${totalFuel} fuel cost, Rs. ${netProfit} net profit.`;

            await createNotification(user.id, 'Weekly Summary', message, 'weekly_summary');
            await sendPushNotification(user.id, 'Weekly Summary', message);
        } catch (err) {
            console.error(`Weekly summary failed for user ${user.id}:`, err.message);
        }
    }

    console.log('Weekly summary job complete.');
};

export const scheduleWeeklySummary = () => {
    cron.schedule('0 21 * * 0', runWeeklySummary);
};

export { runWeeklySummary };