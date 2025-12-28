-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "name_en" VARCHAR(150),
    "full_name" VARCHAR(200),
    "full_name_en" VARCHAR(200),
    "code_name" VARCHAR(150),
    "province_code" VARCHAR(10) NOT NULL,
    "administrative_unit_id" INTEGER,
    "administrative_unit_short_name" VARCHAR(50),
    "administrative_unit_full_name" VARCHAR(100),
    "administrative_unit_short_name_en" VARCHAR(50),
    "administrative_unit_full_name_en" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Province" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100),
    "full_name" VARCHAR(200),
    "full_name_en" VARCHAR(200),
    "code_name" VARCHAR(100),
    "administrative_unit_id" INTEGER,
    "administrative_unit_short_name" VARCHAR(50),
    "administrative_unit_full_name" VARCHAR(100),
    "administrative_unit_full_name_en" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE INDEX "District_province_code_idx" ON "District"("province_code");

-- CreateIndex
CREATE INDEX "District_code_idx" ON "District"("code");

-- CreateIndex
CREATE INDEX "District_name_idx" ON "District"("name");

-- CreateIndex
CREATE INDEX "District_code_name_idx" ON "District"("code_name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE INDEX "Province_code_idx" ON "Province"("code");

-- CreateIndex
CREATE INDEX "Province_name_idx" ON "Province"("name");

-- CreateIndex
CREATE INDEX "Province_code_name_idx" ON "Province"("code_name");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "Province"("code") ON DELETE CASCADE ON UPDATE CASCADE;
