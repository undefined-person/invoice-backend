import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoice1668701510686 implements MigrationInterface {
    name = 'AddInvoice1668701510686'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('paid', 'pending', 'draft')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" SERIAL NOT NULL, "orderId" character varying NOT NULL, "createdAt" TIMESTAMP, "paymentDue" TIMESTAMP, "description" character varying, "paymentTerms" integer, "clientName" character varying, "clientEmail" character varying, "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'draft', "senderAddress" jsonb, "clientAddress" jsonb, "items" jsonb, "total" numeric(10,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
    }

}
