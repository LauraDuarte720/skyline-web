import { Injectable, signal } from '@angular/core';

export interface Announcement {
    id: number;
    type: 'success' | 'error' | 'info';
    text: string;
}


@Injectable({providedIn: 'root'})
export class NotificationsService {
    private nextId = 0;
    announcements = signal<Announcement[]>([]);

    success(text: string):void {
        this.show('success', text);
    }
    
    error(text: string):void {
        this.show('error', text);
    }

    info(text: string):void {
        this.show('info', text);
    }

    remove(id: number):void {
        this.announcements.update((list) => list.filter((announcement) => announcement.id !== id));
    }

    private show(type: Announcement['type'], text: string):void {
        const id = ++this.nextId;
        this.announcements.update((list) => [...list, { id, type, text }]);
        setTimeout(() => this.remove(id), 5000);
    }
}