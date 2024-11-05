export interface IBook {
    id: number;
    title: string;
    author: string;
    year:number;
    available: boolean;
}

export class Book implements IBook {
    constructor(
        public id: number,
        public title: string,
        public author: string,
        public year:number,
        public available: boolean = true
    ) {}
}

export interface IUser {
    id: number;
    name: string;
    email: string;
    borrowedBooks?: IBook[];
}

export class User implements IUser {
    borrowedBooks: IBook[] = [];

    constructor(
        public id: number,
        public name: string,
        public email: string
    ) {}
}