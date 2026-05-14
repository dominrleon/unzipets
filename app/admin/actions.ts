'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createCase(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const slugInput = String(formData.get('slug') ?? '').trim();
  const language = String(formData.get('language') ?? '').trim() || 'en';
  const plushName = String(formData.get('plushName') ?? '').trim();
  const plushSlugInput = String(formData.get('plushSlug') ?? '').trim();

  if (!title) {
    throw new Error('Title is required.');
  }

  if (!plushName) {
    throw new Error('Plush name is required.');
  }

  const slug = normalizeSlug(slugInput || title);
  const plushSlug = normalizeSlug(plushSlugInput || plushName);

  if (!slug) {
    throw new Error('Case slug is required.');
  }

  if (!plushSlug) {
    throw new Error('Plush slug is required.');
  }

  const existingCase = await prisma.case.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingCase) {
    throw new Error('A case with this slug already exists.');
  }

  const existingPlush = await prisma.plush.findUnique({
    where: { slug: plushSlug },
    select: { id: true },
  });

  if (existingPlush) {
    throw new Error('A plush with this slug already exists.');
  }

  const createdCase = await prisma.$transaction(async (tx) => {
    const plush = await tx.plush.create({
      data: {
        name: plushName,
        slug: plushSlug,
        isActive: true,
      },
    });

    const caseItem = await tx.case.create({
      data: {
        plushId: plush.id,
        title,
        slug,
        language,
        status: 'DRAFT',
      },
    });

    const startNode = await tx.decisionNode.create({
      data: {
        caseId: caseItem.id,
        type: 'QUESTION',
        internalKey: 'start',
        title: 'Start question',
        content: 'Write the first question here.',
        sortOrder: 0,
      },
    });

    return tx.case.update({
      where: { id: caseItem.id },
      data: {
        startNodeId: startNode.id,
      },
    });
  });

  revalidatePath('/admin');
  redirect(`/admin/cases/${createdCase.id}`);
}
