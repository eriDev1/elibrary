export type MemberType = 'standard' | 'student' | 'premium';

export class Member {
  id: string;
  name: string;
  email: string;
  memberType: MemberType;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    email: string,
    memberType: MemberType,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.memberType = memberType;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      member_type: this.memberType,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt.toISOString(),
    };
  }
}
