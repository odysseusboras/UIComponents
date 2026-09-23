import { Observable } from 'rxjs';

export type SortDirection = 'asc' | 'desc';

/**
 * Page request issued by the CoreGrid to its data source.
 *
 *   - <c>page</c> is 1-based.
 *   - <c>sortField</c> is the OData-side field name (PascalCase or "User/Email"
 *     for $expand'd joins). Omit for the source's default sort.
 *   - <c>filter</c> is an OData clause contributed by the in-grid filter
 *     components — ANDed with the source's built-in filter (e.g. scope).
 */
export interface PageQuery {
  page: number;
  pageSize: number;
  sortField?: string;
  sortDir?: SortDirection;
  filter?: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
}

export interface OdataSource<T> {
  get(query: PageQuery): Observable<PageResult<T>>;
}

export interface ODataResponse<T> {
  '@odata.context'?: string;
  '@odata.count'?: number;
  value: T[];
}
