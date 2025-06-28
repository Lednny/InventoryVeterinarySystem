import { Injectable } from '@angular/core';

    @Injectable({ providedIn: 'root' })
    export class UserRoleService {
    private role: string = '';

    setRole(role: string) {
        this.role = role;
    }

    getRole(): string {
        return this.role;
    }
}