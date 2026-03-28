import packageJson from '../package.json';

/**
 * Pattern for config is:
 * key: process.env['KEY'] ?? default
 */
const config = {
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description,

    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    port: Number(process.env['PORT'] ?? 3000),

    jwt: {
        /** Trim avoids signature mismatch when .env has accidental spaces/newlines. */
        secret: (process.env['JWT_SECRET'] ?? 'dev-only-change-me').trim(),
        expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    },

    bcryptRounds: Number(process.env['BCRYPT_ROUNDS'] ?? 12),

    /** Optional: allow POST /auth/register/super-admin when header matches (dev/bootstrap). */
    superAdminBootstrapKey: process.env['SUPER_ADMIN_BOOTSTRAP_KEY'] ?? '',

    clientCorsOrigins: {
        'test': process.env['DEV_ORIGIN'] ?? '*',
        'development': process.env['DEV_ORIGIN'] ?? '*',
        'production': process.env['PROD_ORIGIN'] ?? 'none'
    },

    whatsapp: {
        /** twilio | mock */
        provider: process.env['WHATSAPP_PROVIDER'] ?? 'mock',
        twilioAccountSid: process.env['TWILIO_ACCOUNT_SID'] ?? '',
        twilioAuthToken: process.env['TWILIO_AUTH_TOKEN'] ?? '',
        twilioWhatsAppFrom: process.env['TWILIO_WHATSAPP_FROM'] ?? '',
    },

    email: {
        /** resend | mock */
        provider: process.env['EMAIL_PROVIDER'] ?? 'mock',
        resendApiKey: process.env['RESEND_API_KEY'] ?? '',
        from: process.env['EMAIL_FROM'] ?? 'Gym App <no-reply@example.com>',
    },

    /**
     * Google OAuth: comma-separated OAuth 2.0 client IDs (Web / iOS / Android) used to verify `idToken`
     * from mobile or web clients. See https://developers.google.com/identity/sign-in/web/backend-auth
     */
    googleOAuthClientIds: (process.env['GOOGLE_OAUTH_CLIENT_IDS'] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),

    /** Facebook Graph API app id (optional; used when verifying access tokens). */
    facebookAppId: process.env['FACEBOOK_APP_ID'] ?? '',

    /** When both are non-empty, all /api/v1 routes require matching `x-api-key` and `api-token` headers. */
    apiHeaders: (() => {
        const key = process.env['API_KEY'] ?? ''
        const token = process.env['API_TOKEN'] ?? ''
        return {
            key,
            token,
            enabled: Boolean(key && token),
        }
    })(),
}

export default config