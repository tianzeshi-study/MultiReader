import Dexie, { Table } from 'dexie'


export interface BookStorage {
  book_id: string
  name: string
  size: number
  importedAt: number
  updatedAt?: number
  progressPage?: number
  totalPage: number
}



export interface DataStorage {
  book_id: string
  data: string[]
}

export class DataBase extends Dexie {
   books!: Table<BookStorage>;
   // files!: Table<FileStorage>;
   filesData!: Table<DataStorage>;

  constructor(name: string) {
    super(name)


    this.version(1).stores({
      books: 'book_id, name, createdAt, progressPage, totalPage',

filesData: 'book_id, data', 
    })
  }
}

export const db = new DataBase('bookcase');