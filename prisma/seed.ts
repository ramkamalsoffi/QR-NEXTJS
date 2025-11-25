import { PrismaClient } from '@prisma/client';
import { generateBatchNumber } from '../lib/utils/batch-generator';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample products
  const pepperPowder = await prisma.product.upsert({
    where: { name: 'Pepper Powder' },
    update: {},
    create: {
      name: 'Pepper Powder',
    },
  });

  const turmeric = await prisma.product.upsert({
    where: { name: 'Turmeric' },
    update: {},
    create: {
      name: 'Turmeric',
    },
  });

  console.log('✅ Created products:', { pepperPowder, turmeric });

  // Create packages for Pepper Powder
  const pp100mg = await prisma.productPackage.upsert({
    where: { productId_packageName: { productId: pepperPowder.id, packageName: '100mg' } },
    update: {},
    create: {
      productId: pepperPowder.id,
      packageName: '100mg',
    },
  });

  const pp250mg = await prisma.productPackage.upsert({
    where: { productId_packageName: { productId: pepperPowder.id, packageName: '250mg' } },
    update: {},
    create: {
      productId: pepperPowder.id,
      packageName: '250mg',
    },
  });

  // Create packages for Turmeric
  const tu100mg = await prisma.productPackage.upsert({
    where: { productId_packageName: { productId: turmeric.id, packageName: '100mg' } },
    update: {},
    create: {
      productId: turmeric.id,
      packageName: '100mg',
    },
  });

  const tu500mg = await prisma.productPackage.upsert({
    where: { productId_packageName: { productId: turmeric.id, packageName: '500mg' } },
    update: {},
    create: {
      productId: turmeric.id,
      packageName: '500mg',
    },
  });

  console.log('✅ Created packages');

  // Create batch numbers with auto-generated batch codes
  const batch1 = await prisma.batchNumber.upsert({
    where: { batchNo: generateBatchNumber('Pepper Powder', '100mg') },
    update: {},
    create: {
      productId: pepperPowder.id,
      packageId: pp100mg.id,
      batchNo: generateBatchNumber('Pepper Powder', '100mg'), // PE100MG
      reportPdfUrl: 'https://example.com/reports/pe100mg.pdf',
    },
  });

  const batch2 = await prisma.batchNumber.upsert({
    where: { batchNo: generateBatchNumber('Pepper Powder', '250mg') },
    update: {},
    create: {
      productId: pepperPowder.id,
      packageId: pp250mg.id,
      batchNo: generateBatchNumber('Pepper Powder', '250mg'), // PE250MG
      reportPdfUrl: 'https://example.com/reports/pe250mg.pdf',
    },
  });

  const batch3 = await prisma.batchNumber.upsert({
    where: { batchNo: generateBatchNumber('Turmeric', '100mg') },
    update: {},
    create: {
      productId: turmeric.id,
      packageId: tu100mg.id,
      batchNo: generateBatchNumber('Turmeric', '100mg'), // TU100MG
      reportPdfUrl: 'https://example.com/reports/tu100mg.pdf',
    },
  });

  console.log('✅ Created batch numbers:', {
    batch1: batch1.batchNo,
    batch2: batch2.batchNo,
    batch3: batch3.batchNo,
  });

  console.log('');
  console.log('✅ Seeding completed!');
  console.log('');
  console.log('You can now test the application with these batch numbers:');
  console.log(`  - ${batch1.batchNo} (Pepper Powder 100mg)`);
  console.log(`  - ${batch2.batchNo} (Pepper Powder 250mg)`);
  console.log(`  - ${batch3.batchNo} (Turmeric 100mg)`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

