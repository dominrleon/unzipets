'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CaseStatus, NodeType } from '@prisma/client';

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function revalidateCasePaths(caseId: string, extraSlug?: string) {
  revalidatePath('/admin');
  revalidatePath(`/admin/cases/${caseId}`);

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    select: { slug: true },
  });

  if (caseItem?.slug) {
    revalidatePath(`/case/${caseItem.slug}`);
  }

  if (extraSlug && extraSlug !== caseItem?.slug) {
    revalidatePath(`/case/${extraSlug}`);
  }
}

function redirectToCaseEditor(caseId: string) {
  redirect(`/admin/cases/${caseId}`);
}

export async function createDecisionNode(caseId: string, formData: FormData) {
  const internalKey = normalizeSlug(String(formData.get('internalKey') ?? ''));
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const videoUrlRaw = String(formData.get('videoUrl') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();
  const setAsStartNode = formData.get('setAsStartNode') === 'on';

  if (!internalKey) {
    throw new Error('internalKey is required');
  }

  if (!Object.values(NodeType).includes(typeRaw as NodeType)) {
    throw new Error('Invalid node type');
  }

  const existingNode = await prisma.decisionNode.findFirst({
    where: {
      caseId,
      internalKey,
    },
  });

  if (existingNode) {
    throw new Error('A node with this internalKey already exists in this case');
  }

  let sortOrder: number;

  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);

    if (Number.isNaN(sortOrder)) {
      throw new Error('sortOrder is invalid');
    }
  } else {
    const lastNode = await prisma.decisionNode.findFirst({
      where: { caseId },
      orderBy: { sortOrder: 'desc' },
    });

    sortOrder = (lastNode?.sortOrder ?? -1) + 1;
  }

  const newNode = await prisma.decisionNode.create({
    data: {
      caseId,
      internalKey,
      type: typeRaw as NodeType,
      title: title || null,
      content: content || null,
      videoUrl: videoUrlRaw || null,
      sortOrder,
    },
  });

  if (setAsStartNode) {
    await prisma.case.update({
      where: { id: caseId },
      data: {
        startNodeId: newNode.id,
      },
    });
  }

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}

export async function createDecisionAnswer(caseId: string, formData: FormData) {
  const nodeId = String(formData.get('nodeId') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const nextNodeId = String(formData.get('nextNodeId') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  if (!label) {
    throw new Error('Answer text is required');
  }

  if (!nextNodeId) {
    throw new Error('You must select the next node');
  }

  const ownerNode = await prisma.decisionNode.findFirst({
    where: {
      id: nodeId,
      caseId,
    },
  });

  if (!ownerNode) {
    throw new Error('The source node does not exist in this case');
  }

  if (ownerNode.type !== NodeType.QUESTION) {
    throw new Error('Answers can only be added to QUESTION nodes');
  }

  const nextNode = await prisma.decisionNode.findFirst({
    where: {
      id: nextNodeId,
      caseId,
    },
  });

  if (!nextNode) {
    throw new Error('The target node does not exist in this case');
  }

  let sortOrder: number;

  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);

    if (Number.isNaN(sortOrder)) {
      throw new Error('sortOrder is invalid');
    }
  } else {
    const lastAnswer = await prisma.decisionAnswer.findFirst({
      where: { nodeId },
      orderBy: { sortOrder: 'desc' },
    });

    sortOrder = (lastAnswer?.sortOrder ?? -1) + 1;
  }

  await prisma.decisionAnswer.create({
    data: {
      nodeId,
      label,
      nextNodeId,
      sortOrder,
    },
  });

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}

export async function updateCaseMeta(caseId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slug = normalizeSlug(String(formData.get('slug') ?? '').trim());
  const language = String(formData.get('language') ?? '').trim() || 'en';
  const statusRaw = String(formData.get('status') ?? '').trim();

  const fileNumber = String(formData.get('fileNumber') ?? '').trim();
  const caseDate = String(formData.get('caseDate') ?? '').trim();
  const deathDate = String(formData.get('deathDate') ?? '').trim();
  const deathPlace = String(formData.get('deathPlace') ?? '').trim();
  const causeOfDeath = String(formData.get('causeOfDeath') ?? '').trim();
  const investigationText = String(formData.get('investigationText') ?? '').trim();

  const plushName = String(formData.get('plushName') ?? '').trim();
  const plushSlug = normalizeSlug(String(formData.get('plushSlug') ?? '').trim());
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const ageRaw = String(formData.get('age') ?? '').trim();
  const birthDate = String(formData.get('birthDate') ?? '').trim();
  const race = String(formData.get('race') ?? '').trim();
  const origin = String(formData.get('origin') ?? '').trim();
  const identificationNumber = String(formData.get('identificationNumber') ?? '').trim();

  if (!title) {
    throw new Error('title is required');
  }

  if (!slug) {
    throw new Error('slug is required');
  }

  if (!plushName) {
    throw new Error('Plush name is required');
  }

  if (!plushSlug) {
    throw new Error('Plush slug is required');
  }

  if (!Object.values(CaseStatus).includes(statusRaw as CaseStatus)) {
    throw new Error('Invalid case status');
  }

  let age: number | null = null;
  if (ageRaw) {
    age = Number(ageRaw);
    if (Number.isNaN(age)) {
      throw new Error('age is invalid');
    }
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: { plush: true },
  });

  if (!caseItem) {
    throw new Error('Case not found');
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      title,
      slug,
      language,
      status: statusRaw as CaseStatus,
      fileNumber: fileNumber || null,
      caseDate: caseDate || null,
      deathDate: deathDate || null,
      deathPlace: deathPlace || null,
      causeOfDeath: causeOfDeath || null,
      investigationText: investigationText || null,
      plush: {
        update: {
          name: plushName,
          slug: plushSlug,
          imageUrl: imageUrl || null,
          age,
          birthDate: birthDate || null,
          race: race || null,
          origin: origin || null,
          identificationNumber: identificationNumber || null,
        },
      },
    },
  });

  await revalidateCasePaths(caseId, caseItem.slug);
  redirectToCaseEditor(caseId);
}

export async function updateDecisionNode(caseId: string, formData: FormData) {
  const nodeId = String(formData.get('nodeId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const videoUrlRaw = String(formData.get('videoUrl') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();
  const setAsStartNode = formData.get('setAsStartNode') === 'on';

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  const node = await prisma.decisionNode.findFirst({
    where: { id: nodeId, caseId },
  });

  if (!node) {
    throw new Error('Node not found');
  }

  if (!Object.values(NodeType).includes(typeRaw as NodeType)) {
    throw new Error('Invalid node type');
  }

  let sortOrder = node.sortOrder;

  if (sortOrderRaw) {
    const parsed = Number(sortOrderRaw);
    if (Number.isNaN(parsed)) {
      throw new Error('sortOrder is invalid');
    }
    sortOrder = parsed;
  }

  await prisma.decisionNode.update({
    where: { id: nodeId },
    data: {
      title: title || null,
      content: content || null,
      videoUrl: videoUrlRaw || null,
      type: typeRaw as NodeType,
      sortOrder,
    },
  });

  if (setAsStartNode) {
    await prisma.case.update({
      where: { id: caseId },
      data: {
        startNodeId: nodeId,
      },
    });
  }

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}

export async function updateDecisionAnswer(caseId: string, formData: FormData) {
  const answerId = String(formData.get('answerId') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const nextNodeId = String(formData.get('nextNodeId') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();

  if (!answerId) {
    throw new Error('answerId is required');
  }

  if (!label) {
    throw new Error('Answer text is required');
  }

  if (!nextNodeId) {
    throw new Error('You must select the target node');
  }

  const answer = await prisma.decisionAnswer.findFirst({
    where: {
      id: answerId,
      node: {
        caseId,
      },
    },
    include: {
      node: true,
    },
  });

  if (!answer) {
    throw new Error('Answer not found');
  }

  const nextNode = await prisma.decisionNode.findFirst({
    where: {
      id: nextNodeId,
      caseId,
    },
  });

  if (!nextNode) {
    throw new Error('The target node does not exist in this case');
  }

  let sortOrder = answer.sortOrder;

  if (sortOrderRaw) {
    const parsed = Number(sortOrderRaw);
    if (Number.isNaN(parsed)) {
      throw new Error('sortOrder is invalid');
    }
    sortOrder = parsed;
  }

  await prisma.decisionAnswer.update({
    where: { id: answerId },
    data: {
      label,
      nextNodeId,
      sortOrder,
    },
  });

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}

export async function deleteDecisionAnswer(caseId: string, formData: FormData) {
  const answerId = String(formData.get('answerId') ?? '').trim();

  if (!answerId) {
    throw new Error('answerId is required');
  }

  const answer = await prisma.decisionAnswer.findFirst({
    where: {
      id: answerId,
      node: {
        caseId,
      },
    },
  });

  if (!answer) {
    throw new Error('Answer not found');
  }

  await prisma.decisionAnswer.delete({
    where: {
      id: answerId,
    },
  });

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}

export async function deleteDecisionNode(caseId: string, formData: FormData) {
  const nodeId = String(formData.get('nodeId') ?? '').trim();

  if (!nodeId) {
    throw new Error('nodeId is required');
  }

  const node = await prisma.decisionNode.findFirst({
    where: {
      id: nodeId,
      caseId,
    },
    include: {
      case: true,
      _count: {
        select: {
          answers: true,
        },
      },
    },
  });

  if (!node) {
    throw new Error('Node not found');
  }

  if (node.case.startNodeId === node.id) {
    throw new Error('You cannot delete the current start node');
  }

  const incomingLinks = await prisma.decisionAnswer.count({
    where: {
      nextNodeId: node.id,
      node: {
        caseId,
      },
    },
  });

  if (incomingLinks > 0) {
    throw new Error('You cannot delete this node because there are answers pointing to it');
  }

  if (node._count.answers > 0) {
    await prisma.decisionAnswer.deleteMany({
      where: {
        nodeId: node.id,
      },
    });
  }

  await prisma.decisionNode.delete({
    where: {
      id: node.id,
    },
  });

  await revalidateCasePaths(caseId);
  redirectToCaseEditor(caseId);
}
