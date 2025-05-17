
import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideInAnimation =
trigger('routeAnimations', [
    transition('LogInPage <=> SignUpPage', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
        style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
        })
    ]),
    query(':enter', [
        style({ left: '100%', opacity: 0 })
    ]),
    group([
        query(':leave', [
        animate('300ms ease', style({ left: '-100%', opacity: 0 }))
        ]),
        query(':enter', [
        animate('300ms ease', style({ left: '0%', opacity: 1 }))
        ])
    ]),
    ])
]);