import { createWorkersAI } from 'workers-ai-provider';
import { generateText } from 'ai';

export interface ScormLessonInput {
  title: string;
  content: string;
}

export interface ScormFile {
  path: string;
  content: string | Uint8Array;
}

const systemMessage =
  'You are an API backend. Only output the raw result. Do NOT include explanations, markdown, or code fences. Never use backticks (```) in your response.';

export async function generateScormFilesAI(input: ScormLessonInput, env: any): Promise<ScormFile[]> {
  const workersai = createWorkersAI({ binding: env.AI });

  // 1. Generate index.html with at least 3 slides
  const htmlPrompt = `Generate a minimal SCORM-compliant index.html for a lesson.\nLesson title: ${input.title}\nLesson content: ${input.content}\nRequirements:\n- The lesson must be split into at least 3 slides.\n- Each slide should be clearly separated and navigable (e.g., with Next/Previous buttons).\n- Use <h1> for the title on the first slide.\n- Place the lesson content in <div> elements, one per slide.\n- Do not include any external scripts or dependencies.\n- Output only valid HTML.\n- Never use backticks (\`\`\`) in your response.`;

  const { text: html } = await generateText({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    system: systemMessage,
    prompt: htmlPrompt,
    maxTokens: 100000,
  });

  // 2. Generate imsmanifest.xml, using the generated index.html as context
  const manifestPrompt = `Generate a valid SCORM 1.2 imsmanifest.xml for a single lesson.\nLesson title: ${input.title}\nMain file: index.html\nHere is the full index.html content:\n-----\n${html}\n-----\nRequirements:\n- Use identifier SCORM_DEMO_1.\n- Organization identifier: ORG1.\n- Resource identifier: RES1.\n- Output only valid XML.\n- Never use backticks (\`\`\`) in your response.`;

  const { text: manifestXml } = await generateText({
    model: workersai('@cf/meta/llama-4-scout-17b-16e-instruct'),
    system: systemMessage,
    prompt: manifestPrompt,
    maxTokens: 100000,
  });

  return [
    { path: 'imsmanifest.xml', content: manifestXml.trim() },
    { path: 'index.html', content: html.trim() },
  ];
}
