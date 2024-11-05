import '../libs/bootstrap.css';
import '../style/style.css';
import { Library } from './library';
import {Book, User} from './models';
import { LibraryService } from './services';
import { Validation } from './validation';
import { Storage } from './storage';

class App {
    private library: Library<Book>;
    private libraryService: LibraryService;
    private storage: Storage;
    private readonly itemsPerPage:number = 3;
    private currentPage: number = 1;
    constructor() {
        this.storage = new Storage();
        this.library = new Library<Book>();
        this.libraryService = new LibraryService(this.library, this.storage);
    }
    start() {
        this.loadInitialData();
        this.initializeApp();
    }

    private loadInitialData() {
        const savedBooks = this.storage.getBooks();
        savedBooks.forEach(book => this.library.addItem(new Book(book.id, book.title, book.author, book.year, book.available)));
    }
    public initializeApp() {
        document.body.innerHTML = `
            <div class="container mt-4 col-md-12 justify-content-center d-flex flex-column" id="app">
                <h1 class="mb-4">Система Управління Бібліотекою</h1>
                <div class="input-group">
                    <div class="form-outline" data-mdb-input-init>
                        <input type="search" id="search" class="form-control" />
                        <label class="form-label" for="form1">Пошук</label>
                    </div>
                </div>
                    <div >
                        ${this.renderBookForm()}
                    </div>
                    <div id="bookList">
                        ${this.libraryService.renderPaginatedBookList(this.currentPage,3)}
                    </div>
                    <div>
                        ${this.renderUserForm()}
                    </div>
                    <div  id="userList">
                        ${this.libraryService.renderUserList()}
                    </div>
            </div>
        `;
        document.body.innerHTML +=
        `<footer class="bg-body-tertiary text-center text-lg-start">
            <!-- Copyright -->
            <div class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.05);">
                © 2024 Copyright:
                <a class="text-body" href="localhost:9000">My Library</a>
            </div>
            <!-- Copyright -->
        </footer>`;
        this.attachEventListeners();
    }

    private renderBookForm(): string {
        return `
            <h2>Додати Книгу</h2>
            <form id="bookForm" class="border rounded">
                <div class="mb-3">
                    <label for="bookTitle" class="form-label">Назва</label>
                    <input type="text" class="form-control" id="bookTitle">
                    <span id="titleWarning" style="display: none; font-size: 12px; color: red;">Це поле є обов'язковим</span>
                </div>
                <div class="mb-3">
                    <label for="bookAuthor" class="form-label">Автор</label>
                    <input type="text" class="form-control" id="bookAuthor">
                    <span id="authorWarning" style="display: none; font-size: 12px; color: red;">Це поле є обов'язковим</span>
                </div>
                <div class="mb-3">
                    <label for="bookYear" class="form-label">Рік</label>
                    <input type="number" min="0" max="2024" class="form-control" id="bookYear">
                    <span id="yearWarning" style="display: none; font-size: 12px; color: red;">Це поле є обов'язковим</span>
                </div>
                <button type="submit" class="btn btn-primary">Додати Книгу</button>
            </form>
        `;
    }
    private renderUserForm(): string {
        return `
        <h2>Додати Користувача</h2>
        <form id="userForm" class="border rounded">
            <div class="mb-3">
                <label for="userName" class="form-label">Ім'я Користувача</label>
                <input type="text" class="form-control" id="userName">
                <span id="nameWarning" style="display: none; font-size: 12px; color: red;">Це поле є обов'язковим</span>
            </div>
            <div class="mb-3">
                <label for="userEmail" class="form-label">Пошта Користувача</label>
                <input type="text" class="form-control" id="userEmail">
                <span id="emailWarning" style="display: none; font-size: 12px; color: red;">Це поле є обов'язковим</span>
                <span id="emailFormatWarning" style="display: none; font-size: 12px; color: red;">Неправильний формат електронної пошти</span>
            </div>
            <div class="mb-3">
                <label for="userBooks" class="form-label">Книжки Користувача</label>
                <ul class="list-group" id="userBooksList"></ul>
                <select class=" form-select" id="userBooks">
                    ${this.library.getItems().filter(book => book.available).length === 0 ? '<option disabled="disabled" selected=true>Книжок не Знайдено</option>' :
            '<option class="form-select-placeholder" disabled selected hidden>Оберіть Книжку</option>' + this.library.getItems()
                .filter(book => book.available)
                .map(book => `<option value="${book.id}">Книга: ${book.title} by ${book.author}</option>`)}
                </select>
                <button class="btn btn-primary btn-sm" id="addBookForUserButton">Додати Книжку</button>
            </div>
            <button type="submit" class="btn btn-primary">Додати Користувача</button>
        </form>
    `;
    }
    private attachEventListeners() {
        this.attachEventListenersToBooksForm();
        this.attachEventListenersToUsersForm();
        this.attachEventListenersToAddUserBookButton();
        this.attachEventListenerToDeleteBookButtons();
        this.attachEventListenerToDeleteUserButtons();
        this.attachEventListenerToReturnBookButtons();
        this.attachEventListenerToSearchButton();
        this.attachEventListenerToBorrowButtons();
        this.attachEventListenerToCopyUserId();
        this.attachEventListenerToPaginationButtons();
    }
    private attachEventListenersToBooksForm() {
        const bookForm = document.getElementById('bookForm') as HTMLFormElement;
        if (bookForm) {
            bookForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const titleInput = document.getElementById('bookTitle') as HTMLInputElement;
                const authorInput = document.getElementById('bookAuthor') as HTMLInputElement;
                const yearInput = document.getElementById('bookYear') as HTMLInputElement;
                const year = parseInt(yearInput.value);

                const titleWarning = document.getElementById('titleWarning') as HTMLSpanElement;
                const authorWarning = document.getElementById('authorWarning') as HTMLSpanElement;
                const yearWarning = document.getElementById('yearWarning') as HTMLSpanElement;

                let isValid = true;

                titleWarning.style.display = 'none';
                authorWarning.style.display = 'none';
                yearWarning.style.display = 'none';


                if (titleInput.value.trim() === '') {
                    isValid = false;
                    titleWarning.style.display = 'inline';
                }
                if (authorInput.value.trim() === '') {
                    isValid = false;
                    authorWarning.style.display = 'inline';
                }
                if (isNaN(year) || yearInput.value.trim() === '') {
                    isValid = false;
                    yearWarning.style.display = 'inline';
                }


                if (year < 0 || year > 2024) {
                    isValid = false;
                    yearWarning.textContent = 'Рік повинен бути в межах 0 - 2024';
                    yearWarning.style.display = 'inline';
                }

                if (isValid && Validation.validateBookInput(titleInput.value, authorInput.value, year)) {
                    const newBook = new Book(
                        Date.now(),
                        titleInput.value,
                        authorInput.value,
                        year
                    );
                    this.libraryService.addBook(newBook);
                    this.initializeApp();
                }
            });
        }
    }


    private attachEventListenersToUsersForm() {
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const nameInput = document.getElementById('userName') as HTMLInputElement;
                const emailInput = document.getElementById('userEmail') as HTMLInputElement;

                const nameWarning = document.getElementById('nameWarning') as HTMLSpanElement;
                const emailWarning = document.getElementById('emailWarning') as HTMLSpanElement;
                const emailFormatWarning = document.getElementById('emailFormatWarning') as HTMLSpanElement;

                let isValid = true;

                nameWarning.style.display = 'none';
                emailWarning.style.display = 'none';
                emailFormatWarning.style.display = 'none';

                if (nameInput.value.trim() === '') {
                    isValid = false;
                    nameWarning.style.display = 'inline';
                }
                if (emailInput.value.trim() === '') {
                    isValid = false;
                    emailWarning.style.display = 'inline';
                } else {

                    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(emailInput.value)) {
                        isValid = false;
                        emailFormatWarning.style.display = 'inline';
                    }
                }

                if (isValid && Validation.validateUserInput(nameInput.value, emailInput.value)) {
                    let newUser = new User(
                        Date.now(),
                        nameInput.value,
                        emailInput.value
                    );
                    Array.from(document.getElementById('userBooksList')
                        .getElementsByTagName('li'))
                        .map(el => this.storage.getBookById(+el.id) as Book)
                        .forEach(el => this.libraryService.borrowBook(newUser, el));

                    this.libraryService.addUser(newUser);
                    this.initializeApp();
                }
            });
        }
    }

    private attachEventListenersToAddUserBookButton() {
        const addBookForUserButton = document.getElementById('addBookForUserButton');
        if (addBookForUserButton) {
            addBookForUserButton.addEventListener('click', (e) => {
                e.preventDefault();
                const userBooks = document.getElementById('userBooks') as HTMLSelectElement;
                const userBooksList = document.getElementById('userBooksList') as HTMLUListElement;
                const bookId = userBooks.value;
                const book = this.library.getItems().find(b => b.id === +bookId);

                if (book && userBooksList.querySelectorAll(`li`).length < 3) {
                    const array = Array.from(userBooks.selectedOptions);
                    array.forEach(option => {
                        userBooks.remove(option.index);
                    })
                    document.getElementById('userBooksList').innerHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center" id="${book.id}">
                            ${book.title} by ${book.author}
                        </li>
                    `;
                }
                if(userBooks.querySelectorAll(`option`).length === 1) {
                    userBooks.innerHTML += '<option disabled="disabled" selected>Книжок не знайдено</option>';
                }
            });
        }
    }
    private attachEventListenerToDeleteBookButtons() {
        const deleteBookButtons = document.getElementsByClassName('bookList');
        Array.from(deleteBookButtons).forEach(el => el.addEventListener('click', (e) => {
            this.libraryService.removeBook(this.storage.getBookById(+el.getAttribute('bookid')) as Book);
            this.initializeApp();
            console.log("delete operation with book", el.getAttribute('bookid'));
        }))
    }
    private attachEventListenerToReturnBookButtons() {
        const deleteBookButtons = document.getElementsByClassName('userBook');
        Array.from(deleteBookButtons).forEach(el => el.addEventListener('click', (e) => {

            e.stopPropagation();
            this.libraryService.returnBook(this.storage.getUserById(+el.parentElement.parentElement.getAttribute('userid')) as User, this.storage.getBookById(+el.getAttribute('bookid')) as Book);
            this.initializeApp();
            console.log("return operation with user", this.storage.getUserById(+el.parentElement.parentElement.getAttribute('userid')));
        }))
    }
    private attachEventListenerToDeleteUserButtons() {
        const deleteBookButtons = document.getElementsByClassName('userList');
        Array.from(deleteBookButtons).forEach(el => el.addEventListener('click', (e) => {
            this.libraryService.removeUser(this.storage.getUserById(+el.getAttribute('userid')) as User);
            this.initializeApp();
            console.log("delete operation with user", el.getAttribute('userid'));
        }))
    }
    private attachEventListenerToSearchButton() {
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                e.preventDefault();
                const searchInput = document.getElementById('search') as HTMLInputElement;
                const books = searchInput.value === '' ? [] : this.libraryService.searchBooks(searchInput.value);
                document.getElementById('bookList').innerHTML = this.libraryService.renderBookList(books, this.itemsPerPage);
                if(searchInput.value === '') {
                    this.attachEventListenerToPaginationButtons();
                }
            });
        }
    }
    private attachEventListenerToBorrowButtons() {
        const borrowButtons = document.getElementsByClassName('borrowButton');
        Array.from(borrowButtons).forEach(el => el.addEventListener('click', (e) => {
            e.stopPropagation();
            if(el.innerHTML.replace(/\s/g, '') == 'Доступно') {
                this.showPopup(this.storage.getBookById(+el.parentElement.getAttribute('bookid')) as Book);
                console.log("borrow operation");
            }
        }))
    }
    private showPopup(book : Book) {
        const popup = document.createElement('div');
        popup.innerHTML = `
            <div class="overlay"></div>
            <form class="popup border rounded ">
                <div class="mb-3">
                    <h3 for="user-id">Введіть ID користувача</h3>
                    <input class="form-control" type="number" id="user-id">
                </div>
                <button type="submit" class="btn btn-primary">Позичити</button>
                <button id="close-popup" class="btn btn-secondary">Закрити</button>
            </form>
        `;

        document.body.appendChild(popup);

        const form = popup.querySelector('form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const id = (document.getElementById('user-id') as HTMLInputElement).value;
                const user = this.storage.getUserById(+id) as User;
                if(user) {
                    if(user.borrowedBooks.length >= 3) {
                        popup.innerHTML = `
                            <div class="overlay"></div>
                            <form class="popup border rounded ">
                                <div class="mb-3">
                                    <h4>Користувач не може позичити більше 3 книг.</h4>
                                </div>
                                <button id="close-popup" class="btn btn-secondary">Закрити</button>
                            </form>
                        `
                        return;
                    }
                    popup.innerHTML = `
                    <div class="overlay"></div>
                        <form class="popup border rounded ">
                            <div class="mb-3">
                                <h4>Книга ${book.title} була успішно позичена користувачем ${user.name}.</h4>
                            </div>
                            <button id="close-popup" class="btn btn-secondary">Закрити</button>
                        </form>
                    `
                    this.libraryService.borrowBook(user, book);
                    this.libraryService.updateUser(this.storage.getUserById(+id) as User, user);
                }
                else{
                    popup.innerHTML = `
                            <div class="overlay"></div>
                            <form class="popup border rounded ">
                                <div class="mb-3">
                                    <h4>Користувач не знайдений.</h4>
                                </div>
                                <button id="close-popup" class="btn btn-secondary">Закрити</button>
                            </form>
                        `
                }
            });
        }

        const closeButton = document.getElementById('close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.removeChild(popup);
                this.initializeApp();
            });
        }
    }
    private attachEventListenerToCopyUserId() {
        Array.from(document.getElementsByClassName('userNameSpan')).forEach(el => el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.parentElement.parentElement.getAttribute('userid');
            navigator.clipboard.writeText(id);
        }));
    }
    private attachEventListenerToPaginationButtons() {
        document.querySelector('.pagination').querySelectorAll('a').forEach(el =>
            el.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('bookList').innerHTML = this.libraryService.renderPaginatedBookList(+el.getAttribute('data-page'), this.itemsPerPage);
                this.currentPage = +el.getAttribute('data-page');
                console.log("pagination operation with page", el.getAttribute('data-page'));
                this.attachEventListenerToPaginationButtons();
                this.attachEventListenerToBorrowButtons();
                this.attachEventListenerToDeleteBookButtons();
        }))
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.start();
});