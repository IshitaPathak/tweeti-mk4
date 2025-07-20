export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const targetServerUrl = process.env.TARGET_SERVER_URL || 'http://localhost:3000';
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'Tweeti Cron Server (Vercel)',
    targetUrl: targetServerUrl,
    cronSchedule: '0 */12 * * *',
    description: 'Runs every 12 hours via Vercel Cron Jobs',
    endpoints: {
      health: '/api/health',
      cron: '/api/cron',
      manualTrigger: 'POST /api/cron'
    },
    deployment: 'Vercel'
  });
} 