-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "salarioMensual" DECIMAL(65,30),
    "alertasActivas" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingreso" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "subcategoria" TEXT,
    "monto" DECIMAL(65,30) NOT NULL,
    "descripcion" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "esRecurrente" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "entidad" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "montoOriginal" DECIMAL(65,30) NOT NULL,
    "saldoActual" DECIMAL(65,30) NOT NULL,
    "tasaInteres" DECIMAL(65,30),
    "cuotaMensual" DECIMAL(65,30),
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "descripcion" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarjetaCredito" (
    "id" SERIAL NOT NULL,
    "banco" TEXT NOT NULL,
    "nombreTarjeta" TEXT NOT NULL,
    "franquicia" TEXT NOT NULL,
    "cupoTotal" DECIMAL(65,30) NOT NULL,
    "saldoUsado" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "pagoMinimo" DECIMAL(65,30),
    "fechaCorte" INTEGER NOT NULL,
    "fechaPago" INTEGER NOT NULL,
    "tasaInteres" DECIMAL(65,30),
    "estado" TEXT NOT NULL DEFAULT 'ACTIVA',
    "descripcion" TEXT,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarjetaCredito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "deudaId" INTEGER,
    "tarjetaId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amortizacion" (
    "id" SERIAL NOT NULL,
    "deudaId" INTEGER NOT NULL,
    "numeroCuota" INTEGER NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "cuota" DECIMAL(65,30) NOT NULL,
    "capital" DECIMAL(65,30),
    "interes" DECIMAL(65,30),
    "seguro" DECIMAL(65,30),
    "saldoRestante" DECIMAL(65,30),
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amortizacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Ingreso" ADD CONSTRAINT "Ingreso_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarjetaCredito" ADD CONSTRAINT "TarjetaCredito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "TarjetaCredito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amortizacion" ADD CONSTRAINT "Amortizacion_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
