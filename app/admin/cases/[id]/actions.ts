'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { NodeType } from '@prisma/client';

export async function createDecisionNode(caseId: string, formData: FormData) {
  const internalKey = String(formData.get('internalKey') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const videoUrlRaw = String(formData.get('videoUrl') ?? '').trim();
  const typeRaw = String(formData.get('type') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();
  const setAsStartNode = formData.get('setAsStartNode') === 'on';

  if (!internalKey) {
    throw new Error('internalKey és obligatori');
  }

  if (!typeRaw || !Object.values(NodeType).includes(typeRaw as NodeType)) {
    throw new Error('Tipus de node no vàlid');
  }

  const existingNode = await prisma.decisionNode.findFirst({
    where: {
      caseId,
      internalKey,
    },
  });

  if (existingNode) {
    throw new Error('Ja existeix un node amb eixe internalKey en este case');
  }

  let sortOrder: number;

  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);

    if (Number.isNaN(sortOrder)) {
      throw new Error('sortOrder no és vàlid');
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

  revalidatePath('/admin');
  revalidatePath(`/admin/cases/${caseId}`);
}
export async function createDecisionAnswer(caseId: string, formData: FormData) {
  const nodeId = String(formData.get('nodeId') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const nextNodeId = String(formData.get('nextNodeId') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();

  if (!nodeId) {
    throw new Error('nodeId és obligatori');
  }

  if (!label) {
    throw new Error('El text de la resposta és obligatori');
  }

  if (!nextNodeId) {
    throw new Error('Has de seleccionar el node següent');
  }

  const ownerNode = await prisma.decisionNode.findFirst({
    where: {
      id: nodeId,
      caseId,
    },
  });

  if (!ownerNode) {
    throw new Error('El node origen no existeix en este case');
  }

  if (ownerNode.type !== NodeType.QUESTION) {
    throw new Error('Només es poden afegir respostes a nodes QUESTION');
  }

  const nextNode = await prisma.decisionNode.findFirst({
    where: {
      id: nextNodeId,
      caseId,
    },
  });

  if (!nextNode) {
    throw new Error('El node destí no existeix en este case');
  }

  let sortOrder: number;

  if (sortOrderRaw) {
    sortOrder = Number(sortOrderRaw);

    if (Number.isNaN(sortOrder)) {
      throw new Error('sortOrder no és vàlid');
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

  revalidatePath('/admin');
  revalidatePath(`/admin/cases/${caseId}`);
}

export async function updateCaseMeta(caseId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const language = String(formData.get('language') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();

  const fileNumber = String(formData.get('fileNumber') ?? '').trim();
  const caseDate = String(formData.get('caseDate') ?? '').trim();
  const deathDate = String(formData.get('deathDate') ?? '').trim();
  const deathPlace = String(formData.get('deathPlace') ?? '').trim();
  const causeOfDeath = String(formData.get('causeOfDeath') ?? '').trim();
  const investigationText = String(formData.get('investigationText') ?? '').trim();

  const plushName = String(formData.get('plushName') ?? '').trim();
  const plushSlug = String(formData.get('plushSlug') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const ageRaw = String(formData.get('age') ?? '').trim();
  const birthDate = String(formData.get('birthDate') ?? '').trim();
  const race = String(formData.get('race') ?? '').trim();
  const origin = String(formData.get('origin') ?? '').trim();
  const identificationNumber = String(formData.get('identificationNumber') ?? '').trim();

  if (!title) {
    throw new Error('title és obligatori');
  }

  if (!slug) {
    throw new Error('slug és obligatori');
  }

  if (!plushName) {
    throw new Error('El nom del plush és obligatori');
  }

  if (!plushSlug) {
    throw new Error('El slug del plush és obligatori');
  }

  let age: number | null = null;
  if (ageRaw) {
    age = Number(ageRaw);
    if (Number.isNaN(age)) {
      throw new Error('age no és vàlid');
    }
  }

  const caseItem = await prisma.case.findUnique({
    where: { id: caseId },
    include: { plush: true },
  });

  if (!caseItem) {
    throw new Error('Case no trobat');
  }

  await prisma.case.update({
    where: { id: caseId },
    data: {
      title,
      slug,
      language: language || 'en',
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
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

  revalidatePath('/admin');
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath(`/case/${slug}`);
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
    throw new Error('nodeId és obligatori');
  }

  const node = await prisma.decisionNode.findFirst({
    where: { id: nodeId, caseId },
  });

  if (!node) {
    throw new Error('Node no trobat');
  }

  let sortOrder = node.sortOrder;

  if (sortOrderRaw) {
    const parsed = Number(sortOrderRaw);
    if (Number.isNaN(parsed)) {
      throw new Error('sortOrder no vàlid');
    }
    sortOrder = parsed;
  }

  await prisma.decisionNode.update({
    where: { id: nodeId },
    data: {
      title: title || null,
      content: content || null,
      videoUrl: videoUrlRaw || null,
      type: typeRaw as any,
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

  revalidatePath(`/admin/cases/${caseId}`);
}
export async function updateDecisionAnswer(caseId: string, formData: FormData) {
  const answerId = String(formData.get('answerId') ?? '').trim();
  const label = String(formData.get('label') ?? '').trim();
  const nextNodeId = String(formData.get('nextNodeId') ?? '').trim();
  const sortOrderRaw = String(formData.get('sortOrder') ?? '').trim();

  if (!answerId) {
    throw new Error('answerId és obligatori');
  }

  if (!label) {
    throw new Error('El text de la resposta és obligatori');
  }

  if (!nextNodeId) {
    throw new Error('Has de seleccionar el node destí');
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
    throw new Error('Resposta no trobada');
  }

  const nextNode = await prisma.decisionNode.findFirst({
    where: {
      id: nextNodeId,
      caseId,
    },
  });

  if (!nextNode) {
    throw new Error('El node destí no existeix en este case');
  }

  let sortOrder = answer.sortOrder;

  if (sortOrderRaw) {
    const parsed = Number(sortOrderRaw);
    if (Number.isNaN(parsed)) {
      throw new Error('sortOrder no vàlid');
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

  revalidatePath(`/admin/cases/${caseId}`);
}
export async function deleteDecisionAnswer(caseId: string, formData: FormData) {
  const answerId = String(formData.get('answerId') ?? '').trim();

  if (!answerId) {
    throw new Error('answerId és obligatori');
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
    throw new Error('Resposta no trobada');
  }

  await prisma.decisionAnswer.delete({
    where: {
      id: answerId,
    },
  });

  revalidatePath(`/admin/cases/${caseId}`);
}
export async function deleteDecisionNode(caseId: string, formData: FormData) {
  const nodeId = String(formData.get('nodeId') ?? '').trim();

  if (!nodeId) {
    throw new Error('nodeId és obligatori');
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
    throw new Error('Node no trobat');
  }

  if (node.case.startNodeId === node.id) {
    throw new Error('No pots eliminar el start node actual');
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
    throw new Error('No pots eliminar este node perquè hi ha respostes que apunten a ell');
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

  revalidatePath(`/admin/cases/${caseId}`);
}