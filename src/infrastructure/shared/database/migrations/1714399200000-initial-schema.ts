import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1714399200000 implements MigrationInterface {
  name = 'InitialSchema1714399200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`user_entity\` (\`id\` varchar(36) NOT NULL, \`createdAt\` bigint NOT NULL, \`updatedAt\` bigint NOT NULL, \`email\` varchar(255) NOT NULL, \`username\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`birthDate\` date NOT NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_user_entity_email\` (\`email\`), UNIQUE INDEX \`IDX_user_entity_username\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`session_device_entity\` (\`id\` varchar(36) NOT NULL, \`createdAt\` bigint NOT NULL, \`updatedAt\` bigint NOT NULL, \`userId\` varchar(255) NOT NULL, \`deviceId\` varchar(255) NOT NULL, \`sessionDeviceType\` enum ('ANDROID', 'IOS') NOT NULL, \`name\` varchar(255) NOT NULL, \`accessToken\` varchar(512) NOT NULL, \`refreshToken\` varchar(512) NOT NULL, UNIQUE INDEX \`IDX_session_device_entity_refresh_token\` (\`refreshToken\`), UNIQUE INDEX \`IDX_session_device_entity_user_device\` (\`userId\`, \`deviceId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_blocked_entity\` (\`id\` varchar(36) NOT NULL, \`createdAt\` bigint NOT NULL, \`updatedAt\` bigint NOT NULL, \`blockerId\` varchar(255) NOT NULL, \`blockedId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_user_blocked_entity_blocker_blocked\` (\`blockerId\`, \`blockedId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocked_entity\` ADD CONSTRAINT \`FK_user_blocked_entity_blocker\` FOREIGN KEY (\`blockerId\`) REFERENCES \`user_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocked_entity\` ADD CONSTRAINT \`FK_user_blocked_entity_blocked\` FOREIGN KEY (\`blockedId\`) REFERENCES \`user_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_blocked_entity\` DROP FOREIGN KEY \`FK_user_blocked_entity_blocked\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_blocked_entity\` DROP FOREIGN KEY \`FK_user_blocked_entity_blocker\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_blocked_entity_blocker_blocked\` ON \`user_blocked_entity\``,
    );
    await queryRunner.query(`DROP TABLE \`user_blocked_entity\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_session_device_entity_user_device\` ON \`session_device_entity\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_session_device_entity_refresh_token\` ON \`session_device_entity\``,
    );
    await queryRunner.query(`DROP TABLE \`session_device_entity\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_user_entity_username\` ON \`user_entity\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_user_entity_email\` ON \`user_entity\``,
    );
    await queryRunner.query(`DROP TABLE \`user_entity\``);
  }
}
