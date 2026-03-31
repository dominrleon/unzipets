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