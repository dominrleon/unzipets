import { prisma } from '@/lib/prisma';

export async function getPublishedCaseBySlug(slug: string) {
  return prisma.case.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      plush: true,
      startNode: {
        include: {
          answers: {
            orderBy: { sortOrder: 'asc' },
            include: {
              nextNode: true,
            },
          },
        },
      },
    },
  });
}

export async function getAdminCaseList() {
  return prisma.case.findMany({
    include: {
      plush: true,
      nodes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
