export interface CursorPaginationQuery {
  cursor?: string;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
}
