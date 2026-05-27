-- CreateTable
CREATE TABLE "Amortizacion" (
    "id" SERIAL NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "cuota" DECIMAL(10,2) NOT NULL,
    "capital" DECIMAL(10,2),
    "interes" DECIMAL(10,2),
    "seguro" DECIMAL(10,2),
    "saldoRestante" DECIMAL(10,2),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT,
    "deudaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amortizacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Amortizacion" ADD CONSTRAINT "Amortizacion_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
