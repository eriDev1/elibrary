import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMemberUseCase } from '../usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from '../usecases/GetAllMembersUseCase';

export class MemberController {
  constructor(
    private createMemberUseCase: CreateMemberUseCase,
    private getAllMembersUseCase: GetAllMembersUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as { name: string; email: string; memberType: string };
    const member = this.createMemberUseCase.execute(body);
    reply.code(201).send(member);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const members = this.getAllMembersUseCase.execute();
    reply.send(members);
  }
}
