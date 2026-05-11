import Nylas from 'nylas';

export const nylasConfig = {
  clientId: process.env.NYLAS_CLIENT_ID || '',
  clientSecret: process.env.NYLAS_CLIENT_SECRET || '',
  apiKey: process.env.NYLAS_API_KEY || '',
  apiUri: process.env.NYLAS_API_URI || 'https://api.us.nylas.com',
  callbackUri: process.env.NEXT_PUBLIC_NYLAS_CALLBACK_URI || 'http://localhost:3000/api/nylas/callback',
};

export const nylas = new Nylas({
  apiKey: nylasConfig.apiKey,
  apiUri: nylasConfig.apiUri,
});
