// AI工厂
import { AIBeginner } from './aiBeginner.js';
import { AIIntermediate } from './aiIntermediate.js';
import { AIAdvanced } from './aiAdvanced.js';

export function createAI(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return new AIBeginner();
    case 'intermediate':
      return new AIIntermediate();
    case 'advanced':
      return new AIAdvanced();
    default:
      return new AIBeginner();
  }
}

export { AIBeginner, AIIntermediate, AIAdvanced };
