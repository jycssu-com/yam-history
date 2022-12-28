import { QTableProps } from 'quasar'

type QTableColumn = NonNullable<QTableProps['columns']>[0]

export interface TableColumn<T> extends QTableColumn {
  field: string | ((row: T) => unknown);
}
