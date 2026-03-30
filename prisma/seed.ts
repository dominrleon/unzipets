import bcrypt from 'bcryptjs';
import { PrismaClient, CaseStatus, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  const plush = await prisma.plush.upsert({
    where: { slug: 'flash' },
    update: {},
    create: {
      name: 'Flash',
      slug: 'flash',
      description: 'Demo plush for the investigation flow.',
    },
  });

  const existingCase = await prisma.case.findUnique({ where: { slug: 'flash' } });
  if (existingCase) {
    return;
  }

  const createdCase = await prisma.case.create({
    data: {
      plushId: plush.id,
      locale: 'en',
      title: 'Flash Investigation',
      slug: 'flash',
      status: CaseStatus.PUBLISHED,
      introTitle: 'Police Case',
      introText: 'Investigate the cause of death and discover the truth.',
    },
  });

  const start = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.QUESTION,
      internalKey: 'q1',
      title: 'Did the plush die by accident?',
      body: 'Choose the answer that best matches your investigation.',
      sortOrder: 1,
    },
  });

  const finalA = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.FINAL,
      internalKey: 'f1',
      title: 'Accident confirmed',
      body: 'The evidence suggests it was an accident.',
      videoUrl: 'https://videodelivery.net/demo-1',
      sortOrder: 100,
    },
  });

  const finalB = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.FINAL,
      internalKey: 'f2',
      title: 'Foul play discovered',
      body: 'The clues point to a suspicious intervention.',
      videoUrl: 'https://videodelivery.net/demo-2',
      sortOrder: 101,
    },
  });

  await prisma.decisionAnswer.createMany({
    data: [
      { nodeId: start.id, label: 'Yes', nextNodeId: finalA.id, sortOrder: 1 },
      { nodeId: start.id, label: 'No', nextNodeId: finalB.id, sortOrder: 2 },
    ],
  });

  await prisma.case.update({
    where: { id: createdCase.id },
    data: { startNodeId: start.id },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
