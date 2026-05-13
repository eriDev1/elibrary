import { FastifyRequest, FastifyReply } from 'fastify';
import { IAuthService, AuthenticatedUser } from '../domain/interfaces/IAuthService';

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthenticatedUser;
  }
}

export function buildAuthMiddleware(authService: IAuthService) {
  return async function authMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Missing or invalid Authorization header' });
      return;
    }

    const token = authHeader.slice(7);
    const user = await authService.verifyToken(token);

    if (!user) {
      reply.code(401).send({ error: 'Invalid or expired token' });
      return;
    }

    request.user = user;
  };
}
