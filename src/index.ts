import app from './app'
import config from './config'

if (config.nodeEnv === 'production' && !config.apiHeaders.enabled) {
    console.error('Production requires API_KEY and API_TOKEN (sent as x-api-key and api-token on each request).')
    process.exit(1)
}

app.listen(config.port, () => {
    console.log(`🚀 ${config.name} ${config.version} 🚀`)
    console.log(`🚀 Listening on ${config.port} with NODE_ENV=${config.nodeEnv} 🚀`)
})