export abstract class BaseEntity {
  readonly id!: string;
  readonly createdAt!: Date;
  readonly updatedAt!: Date;
  readonly deletedAt?: Date | null;
}
