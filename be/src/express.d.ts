// Augment Express Request to include optional `user` property used in the app
declare namespace Express {
  interface User {
    id?: string
    email?: string
    role?: string
  }

  interface Request {
    user?: User
  }
}
