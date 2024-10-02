export class User {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public password: string,
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
