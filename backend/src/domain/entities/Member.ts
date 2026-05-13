export class Member {
  id: string;
  name: string;
  email: string;
  memberType: string;

  constructor(id: string, name: string, email: string, memberType: string) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.memberType = memberType;
  }
}
