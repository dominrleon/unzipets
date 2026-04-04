import { prisma } from '@/lib/prisma';
import { serializeNode } from '@/lib/serializers';

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

export async function getCasePlayerData(slug: string) {
  const foundCase = await prisma.case.findFirst({
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
          },
        },
      },
    },
  });

  if (!foundCase || !foundCase.startNode) {
    return null;
  }

  return {
    id: foundCase.id,
    slug: foundCase.slug,
    title: foundCase.title,
    fileNumber: foundCase.fileNumber,
    caseDate: foundCase.caseDate,
    deathDate: foundCase.deathDate,
    deathPlace: foundCase.deathPlace,
    causeOfDeath: foundCase.causeOfDeath,
    investigationText: foundCase.investigationText,
    plush: foundCase.plush,
    node: serializeNode(foundCase.startNode),
  };
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
export async function getAdminCaseById(id: string) {
  return prisma.case.findUnique({
    where: { id },
    include: {
      plush: true,
      startNode: true,
      nodes: {
        orderBy: { sortOrder: 'asc' },
        include: {
          answers: {
            orderBy: { sortOrder: 'asc' },
            include: {
              nextNode: true,
            },
          },
        },
      },
      _count: {
        select: {
          scans: true,
        },
      },
    },
  });
}
export async function validateCaseGraph(caseId: string) {
  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      startNode: true,
      nodes: {
        include: {
          answers: {
            include: {
              nextNode: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!caseItem) {
    throw new Error('Case no trobat');
  }

  const issues: string[] = [];
  const nodeMap = new Map(caseItem.nodes.map((node) => [node.id, node]));
  const startNodeId = caseItem.startNodeId;

  if (!startNodeId) {
    issues.push('El case no té start node definit.');
  } else if (!nodeMap.has(startNodeId)) {
    issues.push('El start node definit no pertany a este case.');
  }

  for (const node of caseItem.nodes) {
    if (node.type === 'QUESTION' && node.answers.length === 0) {
      issues.push(`El node QUESTION "${node.internalKey}" no té respostes.`);
    }

    for (const answer of node.answers) {
      if (!answer.nextNodeId || !nodeMap.has(answer.nextNodeId)) {
        issues.push(
          `La resposta "${answer.label}" del node "${node.internalKey}" apunta a un node inexistent.`
        );
      }
    }
  }

  const reachable = new Set<string>();

  if (startNodeId && nodeMap.has(startNodeId)) {
    const stack = [startNodeId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (reachable.has(currentId)) continue;

      reachable.add(currentId);

      const currentNode = nodeMap.get(currentId);
      if (!currentNode) continue;

      for (const answer of currentNode.answers) {
        if (answer.nextNodeId && nodeMap.has(answer.nextNodeId)) {
          stack.push(answer.nextNodeId);
        }
      }
    }
  }

  const orphanNodes = caseItem.nodes.filter((node) => !reachable.has(node.id));
  for (const node of orphanNodes) {
    issues.push(`El node "${node.internalKey}" no és accessible des del start node.`);
  }

  const reachableEndings = caseItem.nodes.filter(
    (node) => reachable.has(node.id) && node.type === 'ENDING'
  );

  if (startNodeId && reachable.size > 0 && reachableEndings.length === 0) {
    issues.push('No hi ha cap node ENDING accessible des del start node.');
  }

  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      totalNodes: caseItem.nodes.length,
      reachableNodes: reachable.size,
      orphanNodes: orphanNodes.length,
      reachableEndings: reachableEndings.length,
    },
  };
}
