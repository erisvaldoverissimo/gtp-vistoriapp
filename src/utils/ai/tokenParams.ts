/**
 * Returns the correct token limit parameter based on the model.
 * GPT-5.x models require `max_completion_tokens` instead of `max_tokens`.
 */
export const getTokenParam = (model: string, tokens: number): Record<string, number> => {
  if (model.startsWith('gpt-5')) {
    return { max_completion_tokens: tokens };
  }
  return { max_tokens: tokens };
};
