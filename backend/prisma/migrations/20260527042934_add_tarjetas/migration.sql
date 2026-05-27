-- CreateTable
CREATE TABLE "TarjetaCredito" (
    "id" SERIAL NOT NULL,
    "banco" TEXT NOT NULL,
    "nombreTarjeta" TEXT NOT NULL,
    "franquicia" TEXT NOT NULL,
    "cupoTotal" DECIMAL(10,2) NOT NULL,
    "saldoUsado" DECIMAL(10,2) NOT NULL,
    "pagoMinimo" DECIMAL(10,2),
    "fechaCorte" INTEGER NOT NULL,
    "fechaPago" INTEGER NOT NULL,
    "tasaInteres" DECIMAL(5,2),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "descripcion" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarjetaCredito_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TarjetaCredito" ADD CONSTRAINT "TarjetaCredito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
