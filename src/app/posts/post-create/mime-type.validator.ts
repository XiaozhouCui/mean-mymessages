import { AbstractControl } from '@angular/forms';
import { Observable, Observer, of } from 'rxjs';

export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  if (typeof control.value === 'string') {
    // "of(null)" returns an observable that will immediately emit data "null", meaning it is VALID
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  // convert sync code (fileReader.onloadend) into an observable
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any }>) => {
      // param observer controls when the observable will emit data
      fileReader.addEventListener('loadend', () => {
        // mime type validation starts here
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
          0,
          4
        );
        let header = '';
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        switch (header) {
          case '89504e47':
            isValid = true;
            break;
          case 'ffd8ffe0':
          case 'ffd8ffe1':
          case 'ffd8ffe2':
          case 'ffd8ffe3':
          case 'ffd8ffe8':
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        // file validation finished
        if (isValid) {
          // if file type is valid (jpg, png, gif...), observer.next() will emit "null"
          observer.next(null);
        } else {
          // if invalid, observer will emit data { invalidMimeType: true }
          observer.next({ invalidMimeType: true });
        }
        // stop emitting new values
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file); // access mime type
    }
  );
  // return the file reader observable
  return frObs;
};
