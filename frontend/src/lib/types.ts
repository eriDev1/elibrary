export type MemberType = 'standard' | 'student' | 'premium'

export interface Book {
  id: string
  title: string
  author: string
  isbn: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  name: string
  email: string
  member_type: MemberType
  created_at: string
  updated_at: string
}

export interface BorrowReportItem {
  id: string
  book_id: string
  book_title: string
  book_author: string
  member_id: string
  member_name: string
  member_email: string
  member_type: string
  borrow_date: string
  due_date: string
  return_date: string | null
}

export interface BorrowRecord {
  id: string
  book_id: string
  member_id: string
  borrow_date: string
  due_date: string
  return_date: string | null
}

export interface MemberActiveBorrow {
  id: string
  book_id: string
  book_title: string
  book_author: string
  book_isbn: string
  borrow_date: string
  due_date: string
}
