import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AiurCollection } from '../Models/AiurCollection';

export function showCommonErrorDialog(err: any) {
    if (err instanceof HttpErrorResponse) {
        const error = err.error as AiurCollection<string>;
        if (error.code === -10) {
            Swal.fire(error.message, error.items.join('\n'), 'error');
        } else {
            Swal.fire(error.message, '', 'error');
        }
    } else {
        Swal.fire('Unknown error', '', 'error');
    }
}
