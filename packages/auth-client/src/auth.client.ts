import axios from "axios";

export interface VerifyTokenResponse {
  valid: boolean;
  userId: string;
  email: string;
  name: string;
}

/**
 * HTTP client for communicating with auth-service.
 * Reads AUTH_SERVICE_URL from the environment at construction time so each
 * service can point it at the right host (docker DNS name vs localhost).
 */
export class AuthServiceClient {
  private client = axios.create({
    baseURL: process.env.AUTH_SERVICE_URL || "http://auth-service:4001",
    timeout: 5000,
  });

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    try {
      const response = await this.client.post<VerifyTokenResponse>(
        "/auth/verify",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Unauthorized");
      }
      throw new Error("Auth service unavailable");
    }
  }
}

// Singleton — safe because AUTH_SERVICE_URL is read once at startup
export const authServiceClient = new AuthServiceClient();
