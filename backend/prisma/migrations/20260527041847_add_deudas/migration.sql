-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "entidad" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "montoOriginal" DECIMAL(10,2) NOT NULL,
    "saldoActual" DECIMAL(10,2) NOT NULL,
    "tasaInteres" DECIMAL(5,2),
    "cuotaMensual" DECIMAL(10,2),
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "descripcion" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
