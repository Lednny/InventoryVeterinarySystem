import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth/data-access/auth.service";

const routerInjection = () => inject(Router);

const authService = () => inject(AuthService);

export const privateGuard: CanActivateFn = async () => {
    const router = routerInjection();
    try {
        const { data, error } = await authService().session();
        console.log('privateGuard session:', data);
        console.log('privateGuard error:', error);
        
        if (error || !data.session) {
            console.log('No session found, redirecting to login');
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
    try {
        const { data } = await authService().session();

        if (data.session) {
            console.log('User already logged in, redirecting to dashboard');
            return router.createUrlTree(['/dashboard']);
        }
        return true;
    } catch (e) {
        console.error('publicGuard error:', e);
        return true;
    }
}; 