import { IBook, IUser } from "./models";

export class Storage {
  saveBooks(books: IBook[]): void {
      localStorage.setItem('books', JSON.stringify(books));
  }

  getBooks(): IBook[] {
      const books = localStorage.getItem('books');
      return books ? JSON.parse(books) : [];
  }

  getBookById(id: number): IBook | undefined {
      const books = this.getBooks();
      return books.find(book => book.id === id);
  }

  saveUsers(users: IUser[]): void {
      localStorage.setItem('users', JSON.stringify(users));
  }

  getUsers(): IUser[] {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
  }

  getUserById(id: number): IUser | undefined {
      const users = this.getUsers();
      return users.find(user => user.id === id);
  }
}