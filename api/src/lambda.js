const serverless = require('serverless-http');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

const app = require('./app');

let secretsLoaded = false;

const loadSecretsFromManager = async () => {
  if (secretsLoaded) return;
  secretsLoaded = true;

  try {
    if (process.env.IS_OFFLINE) {
      // Local/offline mode: use dotenv-based .env
      // eslint-disable-next-line global-require
      require('dotenv').config();
      return;
    }

    const secretId = process.env.SECRETS_ID;
    if (!secretId) return;

    const client = new SecretsManagerClient({});
    const resp = await client.send(new GetSecretValueCommand({ SecretId: secretId }));

    const secretString = resp && typeof resp.SecretString === 'string' ? resp.SecretString : null;
    if (!secretString) return;

    let parsed;
    try {
      parsed = JSON.parse(secretString);
    } catch {
      return;
    }

    if (!parsed || typeof parsed !== 'object') return;

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'undefined') continue;
      if (typeof process.env[key] !== 'undefined') continue;
      process.env[key] = String(value);
    }
  } catch (_err) {
    // Never throw on cold start
  }
};

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  await loadSecretsFromManager();
  return handler(event, context);
};
