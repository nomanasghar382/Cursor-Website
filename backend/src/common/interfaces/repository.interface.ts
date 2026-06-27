export interface Repository<T, Id = string> {
  findById(id: Id): Promise<T | null>;
  create(input: unknown): Promise<T>;
  update(id: Id, input: unknown): Promise<T>;
  softDelete(id: Id): Promise<T>;
}
