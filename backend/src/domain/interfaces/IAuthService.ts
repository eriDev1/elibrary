export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'staff' | 'member';
}

export interface IAuthService {
  verifyToken(bearer: string): Promise<AuthenticatedUser | null>;
  signUpMember(
    email: string,
    password: string,
    name: string,
    memberType: string
  ): Promise<AuthenticatedUser>;
}
