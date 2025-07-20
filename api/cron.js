import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests (Vercel Cron Jobs send POST requests)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log(`🕐 [${new Date().toISOString()}] Vercel Cron Job triggered...`);
    
    // Get configuration from environment variables
    const targetServerUrl = process.env.TARGET_SERVER_URL || 'http://localhost:3000';
    
    console.log(`🎯 Target server: ${targetServerUrl}/cron_post`);
    
    // Make request to the cron_post endpoint
    const response = await axios.post(`${targetServerUrl}/cron_post`, {}, {
      timeout: 300000, // 5 minutes timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tweeti-Vercel-Cron/1.0'
      }
    });

    console.log(`✅ [${new Date().toISOString()}] Cron job completed successfully`);
    console.log(`📊 Response:`, response.data);
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Cron job executed successfully',
      response: response.data
    });
    
  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Cron job failed:`, error.message);
    
    if (error.response) {
      console.error(`📊 Error response:`, error.response.data);
    }
    
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      statusCode: error.response?.status,
      message: 'Cron job failed'
    });
  }
} 