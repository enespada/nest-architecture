export class User {
  constructor(
    public id: string,
    public email: string,
    public username: string,
    public firstName: string,
    public lastName: string,
    public phonePreffix: string | null,
    public phone: string | null,
    public language: string,
    public birthDate: string,
    public password: string,
    /** True when the authenticated user has blocked this user. */
    public isBlockedByLogged?: boolean,
    /** True when this user has blocked the authenticated user. */
    public blockedLogged?: boolean,
  ) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phonePreffix = phonePreffix;
    this.phone = phone;
    this.language = language;
    this.birthDate = birthDate;
    this.password = password;
  }

  get getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
