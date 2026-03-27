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
        secret: process.env['JWT_SECRET'] ?? 'dev-only-change-me',
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
}

export default config