import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { andClauses } from '@borassoft/ui-components';
import { ODataResponse, PageQuery, PageResult } from './odata-source';

export interface OdataFetchOptions {
  /** Built-in scope filter (e.g. CompanyId eq X). ANDed with query.filter. */
  filter?: string;
  /** $expand clause. */
  expand?: string;
  /** Fallback sort field if PageQuery.sortField is not set. */
  defaultSort?: string;
}

/**
 * Fetch one page of OData rows and map them to view-model T. Every service
 * backing a grid goes through this helper, so $top/$skip/$count/$orderby/
 * $filter/$expand and OData envelope unwrapping live in exactly one place.
 * Filters compose: `opts.filter` (service scope) AND `query.filter` (grid filters).
 */
export function fetchOdataPage<TRaw, T>(
  http: HttpClient,
  baseUrl: string,
  query: PageQuery,
  opts: OdataFetchOptions,
  toView: (raw: TRaw) => T,
): Observable<PageResult<T>> {
  const parts = [
    `$top=${query.pageSize}`,
    `$skip=${(Math.max(1, query.page) - 1) * query.pageSize}`,
    `$count=true`,
  ];
  if (opts.expand) parts.push(`$expand=${encodeURIComponent(opts.expand)}`);

  const filter = andClauses([opts.filter, query.filter]);
  if (filter) parts.push(`$filter=${encodeURIComponent(filter)}`);

  const sortField = query.sortField ?? opts.defaultSort;
  if (sortField) parts.push(`$orderby=${encodeURIComponent(`${sortField} ${query.sortDir === 'desc' ? 'desc' : 'asc'}`)}`);

  return http.get<ODataResponse<TRaw>>(`${baseUrl}?${parts.join('&')}`).pipe(
    map(res => ({
      items: (res.value ?? []).map(toView),
      total: res['@odata.count'] ?? res.value?.length ?? 0,
    })),
  );
}
