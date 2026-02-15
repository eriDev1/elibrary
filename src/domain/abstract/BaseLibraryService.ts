export abstract class BaseLibraryService<T> {
  protected items: T[] = [];

  abstract validate(item: T): boolean;

  getAll(): T[] {
    return this.items;
  }

  protected add(item: T): T {
    if (this.validate(item)) {
      this.items.push(item);
    }
    return item;
  }
}
