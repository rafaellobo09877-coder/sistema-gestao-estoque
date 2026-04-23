-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemCode" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "unitMeasure" TEXT,
    "purchasePurpose" TEXT,
    "directorate" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockImport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "warehouse" TEXT,
    "organization" TEXT,
    "reportDate" DATETIME,
    "totalStockValue" REAL,
    "importedById" INTEGER,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    CONSTRAINT "StockImport_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "importId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "reservedQty" REAL NOT NULL DEFAULT 0,
    "reservedValue" REAL NOT NULL DEFAULT 0,
    "availableQty" REAL NOT NULL DEFAULT 0,
    "availableValue" REAL NOT NULL DEFAULT 0,
    "totalQty" REAL NOT NULL DEFAULT 0,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "unitEstimatedValue" REAL,
    "expiry" TEXT,
    CONSTRAINT "MonthlyStock_importId_fkey" FOREIGN KEY ("importId") REFERENCES "StockImport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MonthlyStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "referenceMonth" INTEGER NOT NULL,
    "referenceYear" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "movementDate" DATETIME NOT NULL,
    "note" TEXT,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Movement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Movement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAlert" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "minimumQty" REAL NOT NULL DEFAULT 10,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "StockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemCode_key" ON "Product"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "StockImport_referenceMonth_referenceYear_warehouse_key" ON "StockImport"("referenceMonth", "referenceYear", "warehouse");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyStock_importId_productId_key" ON "MonthlyStock"("importId", "productId");
