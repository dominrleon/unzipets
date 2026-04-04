import bcrypt from 'bcryptjs';
import { PrismaClient, CaseStatus, NodeType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.scanLog.deleteMany();
  await prisma.decisionAnswer.deleteMany();
  await prisma.decisionNode.deleteMany();
  await prisma.case.deleteMany();
  await prisma.plush.deleteMany();
  await prisma.adminUser.deleteMany();

  const password = await bcrypt.hash('admin123', 10);

  await prisma.adminUser.create({
    data: {
      email: 'admin@unzipets.com',
      password,
    },
  });

  const plush = await prisma.plush.create({
    data: {
      name: 'Flash',
      slug: 'flash',
      imageUrl: '/unzipets/animals/flash.png',
      age: 23,
      birthDate: '06 December 2002',
      race: 'Green Turtle',
      origin: 'Akrumal',
      identificationNumber: '3335569179',
      isActive: true,
    },
  });

  const createdCase = await prisma.case.create({
    data: {
      plushId: plush.id,
      title: 'Who did it to Flash?',
      slug: 'flash',
      language: 'en',
      status: CaseStatus.PUBLISHED,
      fileNumber: '18100225AF',
      caseDate: '18/11/2025',
      deathDate: '15/11/2025',
      deathPlace: 'On the coast of Akrumal beach',
      causeOfDeath: 'UNKNOWN (Investigate it yourself)',
      investigationText: 'Investigate the cause of death, discover the truth!',
    },
  });

  const q1 = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.QUESTION,
      internalKey: 'q1',
      title: 'Question 1',
      content: 'Where was Flash last seen?',
      sortOrder: 1,
    },
  });

  const q2 = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.QUESTION,
      internalKey: 'q2',
      title: 'Question 2',
      content: 'Who was acting suspiciously?',
      sortOrder: 2,
    },
  });

  const q3 = await prisma.decisionNode.create({
    data: {
      caseId: createdCase.id,
      type: NodeType.QUESTION,
      internalKey: 'q3',
      title: 'Question 3',
      content: 'What clue did you find?',
      sortOrder: 3,
    },
  });

  const endings = await Promise.all(
    Array.from({ length: 7 }).map((_, index) =>
      prisma.decisionNode.create({
        data: {
          caseId: createdCase.id,
          type: NodeType.ENDING,
          internalKey: `ending_${index + 1}`,
          title: `Ending ${index + 1}`,
          content: `This is ending ${index + 1} for Flash.`,
          videoUrl: `https://example.com/videos/flash-ending-${index + 1}.mp4`,
          sortOrder: 100 + index,
        },
      }),
    ),
  );

  await prisma.decisionAnswer.createMany({
    data: [
      {
        nodeId: q1.id,
        label: 'In the kitchen',
        nextNodeId: q2.id,
        sortOrder: 1,
      },
      {
        nodeId: q1.id,
        label: 'In the garden',
        nextNodeId: q3.id,
        sortOrder: 2,
      },
      {
        nodeId: q2.id,
        label: 'The chef',
        nextNodeId: endings[0].id,
        sortOrder: 1,
      },
      {
        nodeId: q2.id,
        label: 'The butler',
        nextNodeId: endings[1].id,
        sortOrder: 2,
      },
      {
        nodeId: q2.id,
        label: 'Nobody',
        nextNodeId: endings[2].id,
        sortOrder: 3,
      },
      {
        nodeId: q3.id,
        label: 'A red button',
        nextNodeId: endings[3].id,
        sortOrder: 1,
      },
      {
        nodeId: q3.id,
        label: 'A footprint',
        nextNodeId: endings[4].id,
        sortOrder: 2,
      },
      {
        nodeId: q3.id,
        label: 'A note',
        nextNodeId: endings[5].id,
        sortOrder: 3,
      },
      {
        nodeId: q3.id,
        label: 'Nothing',
        nextNodeId: endings[6].id,
        sortOrder: 4,
      },
    ],
  });

  await prisma.case.update({
    where: { id: createdCase.id },
    data: {
      startNodeId: q1.id,
    },
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