import Airtable, { FieldSet, Record } from 'airtable';
import { QueryParams } from 'airtable/lib/query_params';
import { useCallback, useEffect, useState } from 'react';
import uniqBy from './helpers/uniqBy';

/**
 *
 * @usage
 * ```typescript
 * const { records, createRecord, updateRecord, deleteRecord, getRecords, loading } = useAirtable(
 * 'TABLE_NAME',
    AIRTABLE_API_KEY,
    'TABLE_BASE_ID',
    {
      filterByFormula: '{myField} = TRUE()',
    },
  );
 * ```
 * @export
 * @param {string} tableName
 * @param {string} apiKey
 * @param {string} baseId
 * @param {QueryParams<FieldSet>} [selectOptions={}]
 */
export default function useAirtable(
  tableName: string,
  apiKey: string,
  baseId: string,
  selectOptions: QueryParams<FieldSet> = {},
  onError?: (error: unknown) => void,
) {
  const [records, setRecords] = useState<Record<FieldSet>[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const base = new Airtable({ apiKey }).base(baseId);

  const tryCatch = useCallback(
    async function handleTryCatch<T>(
      asyncOperation: () => Promise<T>,
    ): Promise<[unknown, T | void]> {
      setIsLoading(true);
      try {
        const result = await asyncOperation();
        setIsLoading(false);
        return [undefined, result];
      } catch (caughtError) {
        setError(caughtError);
        if (onError) onError(caughtError);
        setIsLoading(false);
        return [error, undefined];
      }
    },
    [onError, setError],
  );

  function getRecords() {
    base(tableName)
      .select({
        view: 'Grid view',
        ...selectOptions,
      })
      .eachPage(
        (fetchedRecords, fetchNextPage) => {
          // This function (`page`) will get called for each page of records.
          setRecords(uniqBy([...records, ...fetchedRecords], 'id'));
          fetchNextPage();
        },
        (err) => {
          setError(err);
          if (onError) {
            onError(err);
          }
        },
      );
  }

  // when the component mounts, get the records
  useEffect(() => {
    getRecords();
  }, []);

  async function createRecord(fields: Record<FieldSet>[]) {
    const [, record] = await tryCatch(() => base(tableName).create(fields));
    if (record) {
      // @ts-ignore
      setRecords([...records, record]);
    }
  }

  async function updateRecord(recordId: string, fields: Record<FieldSet>) {
    const [, updatedRecords] = await tryCatch(() =>
      base(tableName).update([
        {
          ...fields,
          id: recordId,
        },
      ]),
    );
    if (updatedRecords) {
      updatedRecords.forEach((updatedRecord) => {
        // on successful request -> update records state
        setRecords(
          records.map((record) =>
            record.id === recordId ? updatedRecord : record,
          ),
        );
      });
    }
  }

  async function deleteRecord(recordId: string) {
    const [errorOcurred] = await tryCatch(() =>
      base(tableName).destroy(recordId),
    );
    if (!errorOcurred) {
      // on successful request -> update records state
      setRecords(records.filter((record) => record.id !== recordId));
    }
  }

  return {
    records,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecords,
    loading,
    error,
  } as const;
}
