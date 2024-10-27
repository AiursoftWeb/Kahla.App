import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AiurCollection } from '../Models/AiurCollection';

export function showCommonErrorDialog(err: unknown) {
    console.error(err);
    if (err instanceof HttpErrorResponse) {
        if (err.status) {
            const error = err.error as AiurCollection<string>;
            if (error.code === -10) {
                Swal.fire(error.message, error.items.join('\n'), 'error');
            } else {
                Swal.fire(
                    Math.floor(err.status / 100) === 4 ? 'Client Error' : 'Server Error', // 4xx are client errors, 5xx are server errors
                    error.message,
                    'error'
                );
            }
        } else {
            Swal.fire('Network error', err.message, 'error');
        }
    } else {
        Swal.fire('Unknown error', err.toString(), 'error');
    }
}
