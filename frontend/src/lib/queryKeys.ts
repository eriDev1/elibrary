export const queryKeys = {
  session: ['session'] as const,
  books: (search: string = '') => ['books', search] as const,
  members: (search: string = '') => ['members', search] as const,
  borrows: ['borrows'] as const,
  myBorrows: (memberId: string) => ['myBorrows', memberId] as const,
}
