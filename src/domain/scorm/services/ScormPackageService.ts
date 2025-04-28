import { createWorkersAI } from 'workers-ai-provider';
import { generateObject } from 'ai';
import { z } from 'zod';

export interface ScormLessonInput {
  title: string;
  content: string;
}

export interface ScormFile {
  path: string;
  content: string | Uint8Array;
}

const aiTextSchema = z.object({
  response: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
  tool_calls: z.array(z.any()).optional(),
});

export async function generateScormFilesAI(input: ScormLessonInput, env: any): Promise<ScormFile[]> {
  const workersai = createWorkersAI({ binding: env.AI });

  // 1. Generate index.html
  const htmlPrompt = `Generate a minimal SCORM-compliant index.html for a lesson.\nLesson title: ${input.title}\nLesson content: ${input.content}\nRequirements:\n- Use <h1> for the title.\n- Place the lesson content in a <div>.\n- Do not include any scripts.\n- Output only valid HTML.`;

  const { object: htmlObj } = await generateObject({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    prompt: htmlPrompt,
    schema: aiTextSchema,
  });
  const html = htmlObj.response;

  // 2. Generate imsmanifest.xml, using the generated index.html as context
  const manifestPrompt = `Generate a valid SCORM 1.2 imsmanifest.xml for a single lesson.\nLesson title: ${input.title}\nMain file: index.html\nHere is the full index.html content:\n-----\n${html}\n-----\nRequirements:\n- Use identifier SCORM_DEMO_1.\n- Organization identifier: ORG1.\n- Resource identifier: RES1.\n- Output only valid XML.`;

  const { object: manifestObj } = await generateObject({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    prompt: manifestPrompt,
    schema: aiTextSchema,
  });
  const manifestXml = manifestObj.response;

  return [
    { path: 'imsmanifest.xml', content: manifestXml.trim() },
    { path: 'index.html', content: html.trim() },
  ];
}
