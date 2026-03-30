import { prisma } from '@/lib/prisma';

export async function getAdminCaseList() {
  return prisma.case.findMany({
    include: {
      plush: true,
      startNode: true,
      nodes: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: {
          scans: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getPublishedCaseBySlug(slug: string) {
  return prisma.case.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      plush: true,
    },
  });
}

export async function getStartNodeByCaseSlug(slug: string) {
  const foundCase = await prisma.case.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      startNode: {
        include: {
          answers: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!foundCase || !foundCase.startNode) {
    return null;
  }

  return foundCase.startNode;
}

export async function getNextNodeFromAnswer(answerId: string) {
  const answer = await prisma.decisionAnswer.findUnique({
    where: { id: answerId },
    include: {
      nextNode: {
        include: {
          answers: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!answer) {
    return null;
  }

  return answer.nextNode;
}