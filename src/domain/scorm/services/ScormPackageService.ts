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

// Schema for HTML generation
const htmlSchema = z.object({
  html: z.string().describe('A minimal SCORM-compliant index.html as a string with at least 3 slides'),
});

// Schema for manifest XML generation
const manifestSchema = z.object({
  manifest: z.string().describe('A valid SCORM 1.2 imsmanifest.xml as a string'),
});

export async function generateScormFilesAI(input: ScormLessonInput, env: any): Promise<ScormFile[]> {
  const workersai = createWorkersAI({ binding: env.AI });

  // 1. Generate index.html with at least 3 slides
  const htmlPrompt = `Generate a minimal SCORM-compliant index.html for a lesson.\nLesson title: ${input.title}\nLesson content: ${input.content}\nRequirements:\n- The lesson must be split into at least 3 slides.\n- Each slide should be clearly separated and navigable (e.g., with Next/Previous buttons).\n- Use <h1> for the title on the first slide.\n- Place the lesson content in <div> elements, one per slide.\n- Do not include any external scripts or dependencies.\n- Output only valid HTML.\nRespond with a JSON object: {\"html\": <the HTML string>}`;

  const { object: htmlObj } = await generateObject({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    prompt: htmlPrompt,
    schema: htmlSchema,
  });
  const html = htmlObj.html;

  // 2. Generate imsmanifest.xml, using the generated index.html as context
  const manifestPrompt = `Generate a valid SCORM 1.2 imsmanifest.xml for a single lesson.\nLesson title: ${input.title}\nMain file: index.html\nHere is the full index.html content:\n-----\n${html}\n-----\nRequirements:\n- Use identifier SCORM_DEMO_1.\n- Organization identifier: ORG1.\n- Resource identifier: RES1.\n- Output only valid XML.\nRespond with a JSON object: {\"manifest\": <the XML string>}`;

  const { object: manifestObj } = await generateObject({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    prompt: manifestPrompt,
    schema: manifestSchema,
  });
  const manifestXml = manifestObj.manifest;

  return [
    { path: 'imsmanifest.xml', content: manifestXml.trim() },
    { path: 'index.html', content: html.trim() },
  ];
}
