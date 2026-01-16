/**
 * Wizard Mode - Claude helps compose skills interactively
 *
 * Uses Claude to help users design skill compositions
 * through an interactive conversation.
 */
import Anthropic from '@anthropic-ai/sdk';
import { createInterface } from 'node:readline';
import { writeFile } from 'node:fs/promises';

const WIZARD_SYSTEM_PROMPT = `You are a skill composition wizard for Skillixer. Help users design functional compositions of skills.

## Your Role

Guide users through creating a .forge.ts file that composes skills using these operators:

1. **skill()** - Define an inline skill
2. **pipe()** - Sequential execution (A → B → C)
3. **parallel()** - Concurrent execution (A + B + C together)
4. **fork()** - Conditional branching (if X then A else B)
5. **hydrate()** - Inject config into a skill

## Conversation Flow

1. **Understand the goal**: What workflow does the user want to create?
2. **Identify skills**: What individual capabilities are needed?
3. **Design composition**: How should they connect?
4. **Generate code**: Output the .forge.ts file

## Output Format

When ready, output the complete .forge.ts file in a code block:

\`\`\`typescript
import { skill, pipe, parallel, fork, hydrate } from 'skillixer';

// ... skill definitions ...

export default pipe(
  // ... composition ...
);
\`\`\`

## Guidelines

- Ask clarifying questions to understand requirements
- Suggest composition patterns based on the workflow
- Keep skills focused (single responsibility)
- Use parallel() when tasks are independent
- Use fork() when there are decision points
- Use hydrate() when skills need configuration

Be concise but helpful. Guide the user step by step.`;

export interface WizardOptions {
  outputPath?: string;
}

export async function runWizard(options: WizardOptions): Promise<void> {
  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = [];

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = (question: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  console.log('\n🧙 Skillixer Wizard\n');
  console.log('I\'ll help you design a skill composition. Describe what you want to build.\n');
  console.log('Type "done" when you\'re ready to generate, or "quit" to exit.\n');

  // Initial greeting from Claude
  const greeting = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: WIZARD_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: 'Hi! I want to create a new skill composition.',
      },
    ],
  });

  const greetingText = greeting.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  console.log(`🤖 ${greetingText}\n`);

  messages.push({ role: 'user', content: 'Hi! I want to create a new skill composition.' });
  messages.push({ role: 'assistant', content: greetingText });

  // Conversation loop
  while (true) {
    const input = await prompt('You: ');

    if (input.toLowerCase() === 'quit') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return;
    }

    if (input.toLowerCase() === 'done') {
      // Ask Claude to generate the final code
      messages.push({
        role: 'user',
        content: 'Please generate the complete .forge.ts file based on our conversation.',
      });
    } else {
      messages.push({ role: 'user', content: input });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: WIZARD_SYSTEM_PROMPT,
      messages,
    });

    const responseText = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    messages.push({ role: 'assistant', content: responseText });

    console.log(`\n🤖 ${responseText}\n`);

    // Check if response contains a code block (final output)
    if (responseText.includes('```typescript') && input.toLowerCase() === 'done') {
      const codeMatch = responseText.match(/```typescript\n([\s\S]*?)```/);

      if (codeMatch && codeMatch[1]) {
        const code = codeMatch[1];

        if (options.outputPath) {
          await writeFile(options.outputPath, code);
          console.log(`\n📄 Saved to: ${options.outputPath}\n`);
        } else {
          const savePath = await prompt('Save to file? (enter path or leave blank to skip): ');
          if (savePath.trim()) {
            await writeFile(savePath.trim(), code);
            console.log(`\n📄 Saved to: ${savePath.trim()}\n`);
          }
        }
      }

      rl.close();
      return;
    }
  }
}
