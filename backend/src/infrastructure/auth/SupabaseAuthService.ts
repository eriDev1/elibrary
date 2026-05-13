import { SupabaseClient } from '@supabase/supabase-js';
import { IAuthService, AuthenticatedUser } from '../../domain/interfaces/IAuthService';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { Member } from '../../domain/entities/Member';

export class SupabaseAuthService implements IAuthService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly memberRepository: IMemberRepository
  ) {}

  async verifyToken(bearer: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.supabase.auth.getUser(bearer);
    if (error || !data.user) return null;

    const role = (data.user.app_metadata?.role as 'staff' | 'member') ?? 'member';

    return {
      id: data.user.id,
      email: data.user.email ?? '',
      role,
    };
  }

  async signUpMember(
    email: string,
    password: string,
    name: string,
    memberType: string
  ): Promise<AuthenticatedUser> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: 'member' },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Failed to create user');
    }

    const member = new Member(data.user.id, name, email, memberType);
    await this.memberRepository.create(member);

    return {
      id: data.user.id,
      email: data.user.email ?? email,
      role: 'member',
    };
  }
}
