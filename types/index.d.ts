import IUser from '../models/user';
import User from '../models/user';

declare global {
  namespace Express {
    export interface User extends IUser {}
  }
}

// declare global로 타입을 홛
// declare global {
//   namespace Express {
//     interface Request {
//       user?: User;
//     }
//   }
// }

declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
