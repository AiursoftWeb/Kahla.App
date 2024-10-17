import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AiurCollection } from '../Models/AiurCollection';

export function showCommonErrorDialog(err: unknown) {
    if (err instanceof HttpErrorResponse) {
        if (err.error) {
            const error = err.error as AiurCollection<string>;
            if (error.code === -10) {
                Swal.fire(error.message, error.items.join('\n'), 'error');
            } else {
                Swal.fire(error.message, '', 'error');
            }
        } else {
            Swal.fire('Unknown error', err.statusText, 'error');
        }
    } else {
        Swal.fire('Unknown error', err.toString(), 'error');
    }
}
