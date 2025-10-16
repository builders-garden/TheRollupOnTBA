import {
  CensorContext,
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
  TextCensor,
} from "obscenity";
import OpenAI from "openai";
import { env } from "../zod";

const systemPrompt = `
You are a text sanitization system. Your task is to identify and censor all offensive, profane, or slur-based language in any input text by replacing each offensive word entirely with three asterisks (***). You must preserve all other words, punctuation, and formatting exactly as they appear.

Instructions:

Detect and censor any offensive, profane, or discriminatory language, including:

- Explicit sexual content or slurs

- Hate speech (racism, sexism, homophobia, ableism, etc.)

- Strong profanity or vulgar expressions

- Derogatory or violent insults

Replace each offensive or inappropriate word with ***.

Maintain the original text’s structure, punctuation, and spacing.

Do not modify neutral or contextually appropriate words.

Do not explain or comment — output only the sanitized text.

Example Behavior:

Input:
That guy is such an idiot and a damn fool!
Output:
That guy is such an *** and a *** fool!

Input:
I hate those bastards, they’re disgusting.
Output:
I hate those ***, they’re disgusting.
`;

/**
 * Censors text with AI using the OpenAI API
 * @param text - The text to censor
 * @returns The censored text
 * @throws An error if the text cannot be censored with AI
 */
export const censorTextWithAI = async (text: string): Promise<string> => {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.5,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    return content;
  } catch (error) {
    console.error("Error censoring text with AI:", error);
    throw new Error(
      `Failed to censor text with AI: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};

/**
 * Censors text locally using the Obscenity library
 * @param text - The text to censor
 * @returns The censored text
 * @throws An error if the text cannot be censored locally
 */
export const censorTextLocally = (text: string): string => {
  // Initialize Obscenity matcher and censor
  const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
  });
  const asteriskStrategy = (ctx: CensorContext) => "*".repeat(ctx.matchLength);
  const censor = new TextCensor().setStrategy(asteriskStrategy);

  // Filter text from slurs and other bad words
  const matches = matcher.getAllMatches(text);
  const censoredText = censor.applyTo(text, matches);

  // Return censored text
  return censoredText;
};
