export const queryKeys = {
  session: ['session'] as const,
  books: (search: string, pageIndex: number, pageSize: number) =>
    ['books', search, pageIndex, pageSize] as const,
  members: (search: string, pageIndex: number, pageSize: number) =>
    ['members', search, pageIndex, pageSize] as const,
  borrows: (pageIndex: number, pageSize: number) => ['borrows', pageIndex, pageSize] as const,
  myBorrows: (memberId: string, pageIndex: number, pageSize: number) =>
    ['myBorrows', memberId, pageIndex, pageSize] as const,
  myBorrowHistory: (memberId: string, pageIndex: number, pageSize: number) =>
    ['myBorrowHistory', memberId, pageIndex, pageSize] as const,
  memberBorrows: (memberId: string, pageIndex: number, pageSize: number) =>
    ['memberBorrows', memberId, pageIndex, pageSize] as const,
}
