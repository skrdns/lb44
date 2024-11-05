export class Library<T> {
    private items: T[] = [];
    addItem(item: T): void {
        console.log(item);
        this.items.push(item);
    }
    removeItem(item: T): void {
        console.log(this.items, item);
        this.items = this.items.filter(i => JSON.stringify(i) != JSON.stringify(item));
    }

    updateItem(oldItem:T, newItem: T): void {
        this.removeItem(oldItem);
        this.addItem(newItem);
    }

    updateItems(items: T[]): void {
        this.items = items;
    }

    getItems(): T[] {
        return this.items;
    }
}
