export class User {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public password: string,
    /** True when the authenticated user has blocked this user. */
    public isBlockedByLogged?: boolean,
    /** True when this user has blocked the authenticated user. */
    public blockedLogged?: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
  }

  get getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
