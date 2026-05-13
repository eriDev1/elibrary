import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMemberUseCase } from '../usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from '../usecases/GetAllMembersUseCase';
import { UpdateMemberUseCase } from '../usecases/UpdateMemberUseCase';
import { DeleteMemberUseCase } from '../usecases/DeleteMemberUseCase';
import { GetMemberBorrowHistoryUseCase } from '../usecases/GetMemberBorrowHistoryUseCase';
import { MemberType } from '../domain/entities/Member';

interface MemberBody {
  name: string;
  email: string;
  memberType: MemberType;
}

export class MemberController {
  constructor(
    private createMemberUseCase: CreateMemberUseCase,
    private getAllMembersUseCase: GetAllMembersUseCase,
    private updateMemberUseCase: UpdateMemberUseCase,
    private deleteMemberUseCase: DeleteMemberUseCase,
    private getMemberBorrowHistoryUseCase: GetMemberBorrowHistoryUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as MemberBody;
    const member = await this.createMemberUseCase.execute(body);
    reply.code(201).send(member);
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { search?: string };
    const members = await this.getAllMembersUseCase.execute({ search: query.search });
    reply.send(members);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as MemberBody;
    const member = await this.updateMemberUseCase.execute({ id, ...body });
    if (!member) {
      reply.code(404).send({ error: 'Member not found' });
      return;
    }
    reply.send(member);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const ok = await this.deleteMemberUseCase.execute({ id });
    if (!ok) {
      reply.code(400).send({ error: 'Cannot delete member' });
      return;
    }
    reply.code(204).send();
  }

  async borrowHistory(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const rows = await this.getMemberBorrowHistoryUseCase.execute({ memberId: id });
    if (rows === null) {
      reply.code(404).send({ error: 'Member not found' });
      return;
    }
    reply.send(rows);
  }
}
