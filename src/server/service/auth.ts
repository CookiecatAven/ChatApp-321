import {OAuth2Client, TokenPayload} from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type VerifyUserTokenResponse = {
  success: true;
  payload: TokenPayload;
} | {
  success: false;
  errorMessage: string;
};

export const verifyUserToken = async (token: string): Promise<VerifyUserTokenResponse> => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
  }
  try {
    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return {
        success: false,
        errorMessage: 'Invalid token payload'
      };
    }

    return {
      success: true,
      payload
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      errorMessage: 'Authentication error'
    };
  }
};
