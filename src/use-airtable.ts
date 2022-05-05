import Airtable, { FieldSet, Record } from 'airtable';
import { QueryParams } from 'airtable/lib/query_params';
import { useEffect, useState } from 'react';
import uniqBy from './uniqBy';

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
) {
  const [records, setRecords] = useState<Record<FieldSet>[]>([]);
  const [loading, setIsLoading] = useState(false);
  const base = new Airtable({ apiKey }).base(baseId);

  const getRecords = () => {
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
          if (err) {
            console.error(err);
          }
        },
      );
  };

  // when the component mounts, get the records
  useEffect(() => {
    getRecords();
  }, []);

  async function createRecord(fields: Record<FieldSet>[]) {
    setIsLoading(true);
    const record = await base(tableName).create(fields);
    // @ts-ignore
    setRecords([...records, record]);
    setIsLoading(false);
  }

  async function updateRecord(recordId: string, fields: Record<FieldSet>) {
    setIsLoading(true);
    const updatedRecords = await base(tableName).update([
      {
        ...fields,
        id: recordId,
      },
    ]);
    updatedRecords?.forEach((updatedRecord) => {
      // on successful request -> update records state
      setRecords(
        records.map((record) =>
          record.id === recordId ? updatedRecord : record,
        ),
      );
    });
    setIsLoading(false);
  }

  async function deleteRecord(recordId: string) {
    setIsLoading(true);
    await base(tableName).destroy(recordId);
    // on successful request -> update records state
    setRecords(records.filter((record) => record.id !== recordId));
    setIsLoading(false);
  }

  return {
    records,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecords,
    loading,
  } as const;
}
