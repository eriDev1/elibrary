import { FastifyRequest, FastifyReply } from 'fastify';
import { IAuthService } from '../domain/interfaces/IAuthService';

export class AuthController {
  constructor(private authService: IAuthService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as {
      email: string;
      password: string;
      name: string;
      memberType: string;
    };

    try {
      const user = await this.authService.signUpMember(
        body.email,
        body.password,
        body.name,
        body.memberType
      );
      reply.code(201).send(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      reply.code(400).send({ error: message });
    }
  }
}
