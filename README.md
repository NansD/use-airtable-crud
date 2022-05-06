# use-airtable-crud

![npm version](https://img.shields.io/npm/v/use-airtable-crud)
![npm downloads](https://img.shields.io/npm/dw/use-airtable-crud)
## Install
```bash
npm install --save airtable use-airtable-crud
```

## Usage
```typescript
const { records, createRecord, updateRecord, deleteRecord, getRecords, loading } = useAirtable(
    'TABLE_NAME',
    AIRTABLE_API_KEY,
    'TABLE_BASE_ID',
    {
      // optionally, you can add some selectOptions
      filterByFormula: '{myField} = TRUE()',
    },
  );
```
## How was it built ?
I used [this template](https://github.com/kotarella1110/typescript-react-hooks-starter) to build this project. Thank you @kotarella1110 for the great work!

This hook is heavily inspired from [this one](https://github.com/eslintinit/use-airtable), but it has some bugs and looks unmaintained so I decided to make my own.