export class BorrowRecord {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;

  constructor(
    id: string,
    bookId: string,
    memberId: string,
    borrowDate: Date,
    dueDate: Date,
    returnDate?: Date
  ) {
    this.id = id;
    this.bookId = bookId;
    this.memberId = memberId;
    this.borrowDate = borrowDate;
    this.dueDate = dueDate;
    this.returnDate = returnDate;
  }

  toJSON() {
    return {
      id: this.id,
      book_id: this.bookId,
      member_id: this.memberId,
      borrow_date: this.borrowDate.toISOString(),
      due_date: this.dueDate.toISOString(),
      return_date: this.returnDate ? this.returnDate.toISOString() : null,
    };
  }
}
