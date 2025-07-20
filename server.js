import express from 'express';
import axios from 'axios';
import cron from 'node-cron';
import cronParser from 'cron-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Configuration
const config = {
    port: process.env.PORT || 3003,
    targetServerUrl: process.env.TARGET_SERVER_URL || 'http://localhost:3000',
    cronSchedule: process.env.CRON_SCHEDULE || '* * * * *' // Every 1 minute
};

// Function to hit the cron_post endpoint
async function hitCronPostEndpoint() {
    try {
        console.log(`🕐 [${new Date().toISOString()}] Starting scheduled cron job...`);
        
        const response = await axios.post(`${config.targetServerUrl}/cron_post`, {}, {
            timeout: 300000, // 5 minutes timeout
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Tweeti-Cron-Server/1.0'
            }
        });

        console.log(`✅ [${new Date().toISOString()}] Cron job completed successfully`);
        console.log(`📊 Response:`, response.data);
        
        return {
            success: true,
            timestamp: new Date().toISOString(),
            response: response.data
        };
    } catch (error) {
        console.error(`❌ [${new Date().toISOString()}] Cron job failed:`, error.message);
        
        if (error.response) {
            console.error(`📊 Error response:`, error.response.data);
        }
        
        return {
            success: false,
            timestamp: new Date().toISOString(),
            error: error.message,
            statusCode: error.response?.status
        };
    }
}

// Manual trigger endpoint
app.post('/trigger-cron', async (req, res) => {
    try {
        console.log('🚀 Manual cron trigger requested');
        const result = await hitCronPostEndpoint();
        
        if (result.success) {
            res.status(200).json({
                message: 'Cron job triggered successfully',
                result: result
            });
        } else {
            res.status(500).json({
                message: 'Cron job failed',
                result: result
            });
        }
    } catch (error) {
        console.error('❌ Manual trigger error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'Tweeti Cron Server',
        targetUrl: config.targetServerUrl,
        cronSchedule: config.cronSchedule,
        nextRun: getNextCronRun(config.cronSchedule)
    });
});

// Get cron schedule info
app.get('/cron-info', (req, res) => {
    res.status(200).json({
        schedule: config.cronSchedule,
        description: 'Runs every 1 minute',
        nextRun: getNextCronRun(config.cronSchedule),
        targetEndpoint: `${config.targetServerUrl}/cron_post`
    });
});

// Helper function to get next cron run time
function getNextCronRun(cronExpression) {
    try {
        // Use cron-parser for accurate next run calculation
        const interval = cronParser.parseExpression(cronExpression);
        const nextRun = interval.next().toDate();
        return nextRun.toISOString();
    } catch (error) {
        console.error('Error calculating next run time:', error);
        // Fallback calculation for "0 */12 * * *"
        try {
            const now = new Date();
            const currentHour = now.getHours();
            
            // Calculate next run time (every 12 hours at minute 0)
            let nextHour;
            if (currentHour < 12) {
                nextHour = 12; // Next run at 12:00
            } else {
                nextHour = 0; // Next run at 00:00 (next day)
            }
            
            const nextRun = new Date();
            nextRun.setHours(nextHour, 0, 0, 0);
            
            // If we've passed the next run time today, it's tomorrow
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
                nextRun.setHours(0, 0, 0, 0);
            }
            
            return nextRun.toISOString();
        } catch (fallbackError) {
            return 'Next run: Every 12 hours (00:00 and 12:00 UTC)';
        }
    }
}

// Start the cron job
console.log(`⏰ Setting up cron job with schedule: ${config.cronSchedule}`);
console.log(`🎯 Target server: ${config.targetServerUrl}/cron_post`);

const cronJob = cron.schedule(config.cronSchedule, async () => {
    await hitCronPostEndpoint();
}, {
    scheduled: true,
    timezone: "UTC"
});

// Start server
app.listen(config.port, () => {
    console.log(`🚀 Tweeti Cron Server running on port ${config.port}`);
    console.log(`⏰ Cron schedule: ${config.cronSchedule}`);
    console.log(`🎯 Target server: ${config.targetServerUrl}`);
    console.log(`📊 Health check: http://localhost:${config.port}/health`);
    console.log(`🔧 Manual trigger: POST http://localhost:${config.port}/trigger-cron`);
    console.log(`📋 Cron info: http://localhost:${config.port}/cron-info`);
    
    // Log next scheduled run
    const nextRun = getNextCronRun(config.cronSchedule);
    console.log(`⏭️ Next scheduled run: ${nextRun}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down gracefully...');
    cronJob.stop();
    console.log('✅ Cron job stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    cronJob.stop();
    console.log('✅ Cron job stopped');
    process.exit(0);
});

export default app; 