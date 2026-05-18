import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdjustUserPhoneOptional1714399200002
  implements MigrationInterface
{
  name = 'AdjustUserPhoneOptional1714399200002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `user_entity` MODIFY `phonePreffix` varchar(8) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `user_entity` MODIFY `phone` varchar(255) NULL',
    );
    await queryRunner.query(
      "UPDATE `user_entity` SET `phone` = NULL WHERE `phone` = ''",
    );
    await queryRunner.query(
      "UPDATE `user_entity` SET `phonePreffix` = NULL WHERE `phonePreffix` = '' OR `phone` IS NULL",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "UPDATE `user_entity` SET `phonePreffix` = '' WHERE `phonePreffix` IS NULL",
    );
    await queryRunner.query(
      "UPDATE `user_entity` SET `phone` = '' WHERE `phone` IS NULL",
    );
    await queryRunner.query(
      "ALTER TABLE `user_entity` MODIFY `phone` varchar(255) NOT NULL DEFAULT ''",
    );
    await queryRunner.query(
      "ALTER TABLE `user_entity` MODIFY `phonePreffix` varchar(255) NOT NULL DEFAULT ''",
    );
  }
}
