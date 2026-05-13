import { IUseCase } from '../domain/interfaces/IUseCase';
import { IBookRepository } from '../domain/interfaces/IBookRepository';

export interface DeleteBookInput {
  id: string;
}

export class DeleteBookUseCase implements IUseCase<DeleteBookInput, Promise<boolean>> {
  constructor(private bookRepository: IBookRepository) {}

  execute(input: DeleteBookInput): Promise<boolean> {
    return this.bookRepository.delete(input.id);
  }
}
