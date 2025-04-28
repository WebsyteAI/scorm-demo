// AI-powered SCORM file generator using Cloudflare Workers AI
// This version replaces static HTML/XML generation with AI model output

export interface ScormLessonInput {
  title: string;
  content: string;
}

export interface ScormFile {
  path: string;
  content: string | Uint8Array;
}

/**
 * Extracts the generated text from the AI response according to the output schema.
 */
function extractAIText(aiResponse: any): string {
  if (typeof aiResponse === 'string') return aiResponse;
  if (aiResponse && typeof aiResponse.response === 'string') return aiResponse.response;
  // fallback for other possible formats
  if (aiResponse && aiResponse.message && typeof aiResponse.message.content === 'string') return aiResponse.message.content;
  if (aiResponse && aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message && typeof aiResponse.choices[0].message.content === 'string') return aiResponse.choices[0].message.content;
  return '';
}

/**
 * Generates SCORM files (imsmanifest.xml and index.html) using Cloudflare's AI service.
 * @param input Lesson input
 * @param env Worker environment (must include AI binding)
 */
export async function generateScormFilesAI(input: ScormLessonInput, env: any): Promise<ScormFile[]> {
  // 1. Generate index.html
  const htmlPrompt = `Generate a minimal SCORM-compliant index.html for a lesson.\nLesson title: ${input.title}\nLesson content: ${input.content}\nRequirements:\n- Use <h1> for the title.\n- Place the lesson content in a <div>.\n- Do not include any scripts.\n- Output only valid HTML.`;

  const htmlResponse = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: [
      { role: "system", content: "You are an expert in generating SCORM-compliant HTML and XML files." },
      { role: "user", content: htmlPrompt }
    ]
  });
  const html = extractAIText(htmlResponse);

  // 2. Generate imsmanifest.xml, using the generated index.html as context
  const manifestPrompt = `Generate a valid SCORM 1.2 imsmanifest.xml for a single lesson.\nLesson title: ${input.title}\nMain file: index.html\nHere is the full index.html content:\n-----\n${html}\n-----\nRequirements:\n- Use identifier SCORM_DEMO_1.\n- Organization identifier: ORG1.\n- Resource identifier: RES1.\n- Output only valid XML.`;

  const manifestResponse = await env.AI.run("@cf/meta/llama-4-scout-17b-16e-instruct", {
    messages: [
      { role: "system", content: "You are an expert in generating SCORM-compliant HTML and XML files." },
      { role: "user", content: manifestPrompt }
    ]
  });
  const manifestXml = extractAIText(manifestResponse);

  return [
    { path: "imsmanifest.xml", content: manifestXml.trim() },
    { path: "index.html", content: html.trim() },
  ];
}
