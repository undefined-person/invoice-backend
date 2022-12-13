import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelationBetweenInvoiceAndUser1670918490798 implements MigrationInterface {
    name = 'AddRelationBetweenInvoiceAndUser1670918490798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_9909d4616f166cc7d6107553510" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_9909d4616f166cc7d6107553510"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "ownerId"`);
    }

}
