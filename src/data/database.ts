import Dexie, { Table } from 'dexie'


export interface BookStorage {
  id: string
  name: string
  size: number
  importedAt: number
  updatedAt?: number
  progressPage?: number
  totalPage: number
}


/* export interface FileStorage {
  id: string
  file: File
} */

export interface DataStorage {
  id: string
  data: string[]
}

export class DataBase extends Dexie {
   books!: Table<BookStorage>;
   // files!: Table<FileStorage>;
   filesData!: Table<DataStorage>;

  constructor(name: string) {
    super(name)


    this.version(1).stores({
      books: 'id, name, createdAt, progressPage, totalPage',
// files: 'id, file',
filesData: 'id, data', 
    })
  }
}

export const db = new DataBase('bookcase');