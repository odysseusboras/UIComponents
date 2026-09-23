import { SelectOption } from '@borassoft/ui-components';

/**
 * The standard Active / Deleted / All filter every soft-deletable management
 * grid projects, as a `<ui-shared-segmented>`. Pair with `softDeleteClauseBuilder`.
 */
export const SOFT_DELETE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'active',  labelKey: 'common.filter.active' },
  { value: 'deleted', labelKey: 'common.filter.deleted' },
  { value: 'all',     labelKey: 'common.filter.all' },
];

/** OData clause for `SOFT_DELETE_STATUS_OPTIONS` against the row's `IsDeleted` flag. */
export function softDeleteClauseBuilder(v: string): string | null {
  if (v === 'active')  return 'IsDeleted eq false';
  if (v === 'deleted') return 'IsDeleted eq true';
  return null;
}
