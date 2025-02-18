import Dexie, { Table } from 'dexie'


export interface BookStorage {
  // use file hash as id
  id: string
  name: string
  dataUrl: string
  size: number
  importedAt: number
  updatedAt?: number
  progressPage: number
  totalPage: number
}


export class DataBase extends Dexie {
   books!: Table<BookStorage>;

  constructor(name: string) {
    super(name)


    this.version(1).stores({
      books: 'id, name, data, createdAt, progressPage, totalPage', 
    })
  }
}

export const db = new DataBase('bookcase')
