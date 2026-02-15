export class BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;

  constructor(id: string, bookId: string, memberId: string, borrowDate: Date, dueDate: Date) {
    this.id = id;
    this.bookId = bookId;
    this.memberId = memberId;
    this.borrowDate = borrowDate;
    this.dueDate = dueDate;
  }
}
