import { NodeType, type DecisionNode, type DecisionAnswer } from '@prisma/client';

type NodeWithAnswers = DecisionNode & {
  answers?: DecisionAnswer[];
};

export function serializeNode(node: NodeWithAnswers) {
  return {
    id: node.id,
    type: node.type as NodeType,
    title: node.title,
    content: node.content,
    videoUrl: node.videoUrl,
    answers:
      node.type === 'QUESTION'
        ? (node.answers ?? []).map((answer) => ({
            id: answer.id,
            label: answer.label,
          }))
        : [],
  };
}