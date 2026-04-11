export class UserBlocked {
  constructor(
    public id: string,
    public blockerId: string,
    public blockedId: string,
    public createdAt: Date,
  ) {}
}
