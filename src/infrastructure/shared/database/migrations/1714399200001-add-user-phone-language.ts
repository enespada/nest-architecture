import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPhoneLanguage1714399200001 implements MigrationInterface {
  name = 'AddUserPhoneLanguage1714399200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `user_entity` ADD `phonePreffix` varchar(255) NOT NULL DEFAULT ''",
    );
    await queryRunner.query(
      "ALTER TABLE `user_entity` ADD `phone` varchar(255) NOT NULL DEFAULT ''",
    );
    await queryRunner.query(
      "ALTER TABLE `user_entity` ADD `language` varchar(255) NOT NULL DEFAULT ''",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `user_entity` DROP COLUMN `language`');
    await queryRunner.query('ALTER TABLE `user_entity` DROP COLUMN `phone`');
    await queryRunner.query(
      'ALTER TABLE `user_entity` DROP COLUMN `phonePreffix`',
    );
  }
}
