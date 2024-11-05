export class Validation {
    static validateBookInput(title: string, author: string, year: number): boolean {
        return title.trim() !== '' && author.trim() !== '' && year >= 0 && year <= 2024;
    }

    static validateUserInput(name: string, email: string): boolean {
        const regex = new RegExp(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/);
        return name.trim() !== '' && regex.test(email);
    }
}