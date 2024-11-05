import {Book, User, IBook, IUser} from './models';
import {Library} from './library';
import {Storage} from './storage';

export class LibraryService {
    constructor(
        private library: Library<Book>,
        private storage: Storage
    ) {}

    addBook(book: Book): void {
        this.library.addItem(book);
        this.storage.saveBooks(this.library.getItems());
    }
    removeBook(book: Book): void {
        this.library.removeItem(book);
        const users = this.storage.getUsers();
        users.forEach(user =>{
            //видаляє книгу з позичених книг користувача
            user.borrowedBooks = user.borrowedBooks.filter(b => b.id !== book.id); 
        });
        this.storage.saveUsers(users);
        this.storage.saveBooks(this.library.getItems());
    }

    addUser(user: User): void {
        this.storage.saveUsers([user, ...this.storage.getUsers()]);
    }
    removeUser(user: User): void {
        const books = this.storage.getBooks();
        books.forEach(book =>{
            //повертає доступність книги, якщо вона була позичена користувачем
            book.available = user.borrowedBooks.find(b => b.id === book.id) ? true : book.available; 
        });
        this.storage.saveBooks(books);
        this.library.updateItems(books as []);
        this.storage.saveUsers(this.storage.getUsers().filter(u => u.id !== user.id));
    }

    updateUser(oldUser: User, newUser: User): void {
        this.storage.saveUsers([newUser, ...this.storage.getUsers().filter(u => u.id !== oldUser.id)]);
    }

    borrowBook(user: User, book: Book): void {
        const borrowedBook = structuredClone(book);
        borrowedBook.available = false;
        user.borrowedBooks.push(borrowedBook);
        this.library.updateItem(book, borrowedBook);
        this.storage.saveBooks(this.library.getItems());
    }

    returnBook(user: User, book: Book): void {
        const index = user.borrowedBooks.findIndex(b => b.id === book.id);
        if (index > -1) {
            user.borrowedBooks.splice(index, 1);
            const newBook = structuredClone(book);
            newBook.available = true;
            this.library.updateItem(book, newBook);
            this.storage.saveBooks(this.library.getItems());
            this.storage.saveUsers([user, ...this.storage.getUsers().filter(u => u.id !== user.id)]); 
        }
    }
    searchBooks(query: string): Book[] {
        return this.library.getItems().filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase())
        );
    }
    renderBookList(books? : Book[], itemsPerPage?: number): string {
        if(books.length > 0)
            return `
                <h2>Список Книг</h2>
                <ul class="list-group">
                    ${books.map(book => `<li title="Delete book" class="list-group-item bookList d-flex justify-content-between align-items-center" bookid="${book.id}">
                        ${book.title} by ${book.author} (${book.year})
                        <span title="Borrow book" class="badge bg-${book.available ? 'success' : 'danger'} rounded-pill borrowButton">
                            ${book.available ? 'Доступно' : 'Позичено'}
                        </span>
                    </li>`).join('')}
                </ul>
            `;
        else
            return this.renderPaginatedBookList(1, itemsPerPage);
    }
    renderUserList(): string {
        const users = this.storage.getUsers();
        return `
            <h2>Список Користувачів</h2>
            <ul class="list-group">
                ${users.map(user => `
                    <li class="list-group-item userList d-flex flex-column align-items-start" userid="${user.id}">
                        <h4>Ім'я користувача: <span class="userNameSpan" title="Copy user id">${user.name}</span></h4>
                        <h4>Пошта користувача: ${user.email}</h4>
                        <h5>Позичені книги:</h5>
                        <ul class="list-group inner-list">
                            ${user.borrowedBooks.length === 0 ?
                                `<li class="list-group-item">Нема позичених книг</li>` :
                                user.borrowedBooks.map(book => `
                                    <li class="list-group-item userBook" bookid="${book.id}">Книга: ${book.title} by ${book.author}</li>
                                `).join('')
                            }
                        </ul>
                    </li>
                `).join('')}
            </ul>
        `;
    }
    //пінгація
    getPaginatedBooks(page: number, itemsPerPage: number): Book[] {
        const startIndex = (page - 1) * itemsPerPage;
        return this.library.getItems().slice(startIndex, startIndex + itemsPerPage);
    }

    renderPaginatedBookList(page: number, itemsPerPage: number): string {
        const books = this.getPaginatedBooks(page, itemsPerPage);
        return `
            <h2>Список Книг</h2>
            <ul class="list-group">
                ${books.map(book => `<li title="Delete book" class="list-group-item bookList d-flex justify-content-between align-items-center" bookid="${book.id}">
                    ${book.title} by ${book.author} (${book.year})
                    <span title="Borrow book" class="badge bg-${book.available ? 'success' : 'danger'} rounded-pill borrowButton">
                        ${book.available ? 'Доступно' : 'Позичено'}
                    </span>
                </li>`).join('')}
            </ul>
            ${this.renderPagination(page, itemsPerPage)}
        `;
    }

    private renderPagination(currentPage: number, itemsPerPage: number): string {
        const totalBooks = this.library.getItems().length;
        const totalPages = Math.ceil(totalBooks / itemsPerPage);
        
        let paginationHTML = '<nav aria-label="Book list pagination"><ul class="pagination">';
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" data-page="${i}">${i}</a>
                </li>
            `;
        }
        paginationHTML += '</ul></nav>';
        return paginationHTML;
    }
}