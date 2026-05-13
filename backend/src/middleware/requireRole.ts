import { FastifyRequest, FastifyReply } from 'fastify';

export function requireRole(role: 'staff' | 'member') {
  return async function roleMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    if (!request.user || request.user.role !== role) {
      reply.code(403).send({ error: `Requires role: ${role}` });
    }
  };
}
