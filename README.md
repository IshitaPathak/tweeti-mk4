# Tweeti Cron Server (mk4_tweeti_gapp)

A dedicated cron server that automatically hits the `cron_post` endpoint of the main Tweeti server every 12 hours to process and post tweets for all registered users.

## 🚀 Features

- **Automated Scheduling**: Runs every 12 hours using node-cron
- **Manual Trigger**: Endpoint to manually trigger the cron job
- **Health Monitoring**: Health check and cron info endpoints
- **Error Handling**: Comprehensive error logging and handling
- **Configurable**: Environment-based configuration
- **Graceful Shutdown**: Proper cleanup on server shutdown

## 📋 Prerequisites

- Node.js (v16 or higher)
- The main Tweeti server (mk3_tweeti_gapp) running with the `/cron_post` endpoint

## 🛠️ Installation

1. **Clone and navigate to the directory:**
   ```bash
   cd mk4_tweeti_gapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   TARGET_SERVER_URL=http://localhost:3000
   CRON_SCHEDULE=0 */12 * * *
   ```

## 🚀 Usage

### Start the server:
```bash
npm start
```

### Development mode:
```bash
npm run dev
```

## 📡 API Endpoints

### Local Development:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check endpoint |
| `/cron-info` | GET | Get cron schedule information |
| `/trigger-cron` | POST | Manually trigger the cron job |

### Vercel Deployment:
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check endpoint |
| `/api/cron` | POST | Cron job endpoint (triggered automatically every 12 hours) |

### Health Check Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "server": "Tweeti Cron Server",
  "targetUrl": "http://localhost:3000",
  "cronSchedule": "0 */12 * * *",
  "nextRun": "2024-01-01T12:00:00.000Z"
}
```

### Manual Trigger:
```bash
curl -X POST http://localhost:3001/trigger-cron
```

## ⏰ Cron Schedule

The default schedule runs every 12 hours:
- **Schedule**: `0 */12 * * *`
- **Times**: 00:00 and 12:00 UTC daily

### Custom Schedules

You can modify the `CRON_SCHEDULE` environment variable:

```env
# Every 6 hours
CRON_SCHEDULE=0 */6 * * *

# Daily at midnight
CRON_SCHEDULE=0 0 * * *

# Every 4 hours
CRON_SCHEDULE=0 */4 * * *
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `TARGET_SERVER_URL` | `http://localhost:3000` | URL of the main Tweeti server |
| `CRON_SCHEDULE` | `0 */12 * * *` | Cron schedule expression |

## 📊 Monitoring

The server provides several monitoring endpoints:

1. **Health Check**: `GET /health`
2. **Cron Info**: `GET /cron-info`
3. **Manual Trigger**: `POST /trigger-cron`

### Logs

The server logs all activities:
- ✅ Successful cron job executions
- ❌ Failed cron job attempts
- 🚀 Manual trigger requests
- 🛑 Graceful shutdown events

## 🔄 How It Works

1. **Scheduled Execution**: The cron job runs every 12 hours automatically
2. **HTTP Request**: Makes a POST request to `{TARGET_SERVER_URL}/cron_post`
3. **Processing**: The main server processes all users and their commits
4. **Tweet Generation**: Generates tweets based on user settings and commits
5. **Posting**: Posts tweets to Twitter for each user
6. **Cleanup**: Clears processed commits from the database

## 🚨 Error Handling

- **Network Errors**: Logs and continues with next scheduled run
- **Server Errors**: Logs detailed error information
- **Timeout**: 5-minute timeout for each cron job execution
- **Graceful Shutdown**: Stops cron job before server shutdown

## 📝 Example Usage

### Starting the server:
```bash
npm start
```

### Checking server status:
```bash
curl http://localhost:3001/health
```

### Manually triggering cron job:
```bash
curl -X POST http://localhost:3001/trigger-cron
```

### Getting cron information:
```bash
curl http://localhost:3001/cron-info
```

## 🔒 Security Considerations

- The server only makes outbound requests to the configured target server
- No sensitive data is stored or processed
- All requests include proper headers and timeouts
- Environment variables should be properly secured in production

## 🚀 Deployment

### Vercel Deployment (Recommended):

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `TARGET_SERVER_URL`: URL of your main Tweeti server (e.g., `https://your-tweeti-server.vercel.app`)

4. **The cron job will automatically run every 12 hours via Vercel Cron Jobs**

### Production Deployment (Traditional):

1. **Set environment variables:**
   ```env
   PORT=3001
   TARGET_SERVER_URL=https://your-tweeti-server.com
   CRON_SCHEDULE=0 */12 * * *
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Monitor logs:**
   ```bash
   tail -f logs/app.log
   ```

### Docker Deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 