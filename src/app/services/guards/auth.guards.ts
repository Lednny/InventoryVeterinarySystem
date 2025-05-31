import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth/data-access/auth.service";

const routerInjection = () => inject(Router);

const authService = () => inject(AuthService);

export const privateGuard: CanActivateFn = async () => {
    const router = routerInjection();
    try {
        const { data } = await authService().session();
        console.log('privateGuard session:', data);
        if (!data.session) {
            return router.createUrlTree(['/auth/log-in']);
        }
        return true;
    } catch (e) {
        console.error('privateGuard error:', e);
        return router.createUrlTree(['/auth/log-in']);
    }
};

export const publicGuard: CanActivateFn = async () =>  {
    const router = routerInjection();
    const { data } = await authService().session();

    if (data.session) {
        return router.createUrlTree(['/dashboard']);
    }
    return true 
}; 