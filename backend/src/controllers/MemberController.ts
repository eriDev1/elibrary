import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateMemberUseCase } from '../usecases/CreateMemberUseCase';
import { GetAllMembersUseCase } from '../usecases/GetAllMembersUseCase';
import { UpdateMemberUseCase } from '../usecases/UpdateMemberUseCase';
import { DeleteMemberUseCase } from '../usecases/DeleteMemberUseCase';
import { GetMemberBorrowHistoryUseCase } from '../usecases/GetMemberBorrowHistoryUseCase';
import { MemberType } from '../domain/entities/Member';
import { parsePagedQuery } from '../util/parsePagedQuery';

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
    reply.code(201).send(member.toJSON());
  }

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const q = request.query as Record<string, string | string[] | undefined>;
    const { page, pageSize, search } = parsePagedQuery(q);
    const result = await this.getAllMembersUseCase.execute({ page, pageSize, search });
    reply.send({
      items: result.items.map((m) => m.toJSON()),
      total: result.total,
    });
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = request.body as MemberBody;
    const member = await this.updateMemberUseCase.execute({ id, ...body });
    if (!member) {
      reply.code(404).send({ error: 'Member not found' });
      return;
    }
    reply.send(member.toJSON());
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
    const q = request.query as Record<string, string | string[] | undefined>;
    const { page, pageSize } = parsePagedQuery(q);
    const result = await this.getMemberBorrowHistoryUseCase.execute({
      memberId: id,
      page,
      pageSize,
    });
    if (result === null) {
      reply.code(404).send({ error: 'Member not found' });
      return;
    }
    reply.send({ items: result.items, total: result.total });
  }
}
