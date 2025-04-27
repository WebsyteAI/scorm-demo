import { ScormManifest, generateManifestXML } from "../models/ScormManifestModel";

export interface ScormLessonInput {
  title: string;
  content: string;
}

export interface ScormFile {
  path: string;
  content: string | Uint8Array;
}

export function generateScormFiles(input: ScormLessonInput): ScormFile[] {
  const manifest: ScormManifest = {
    identifier: "SCORM_DEMO_1",
    title: input.title,
    items: [
      {
        identifier: "ITEM1",
        title: input.title,
        href: "index.html",
      },
    ],
  };

  const manifestXml = generateManifestXML(manifest);
  const indexHtml = `<!DOCTYPE html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <title>${input.title}</title>
</head>
<body>
  <h1>${input.title}</h1>
  <div>${input.content}</div>
</body>
</html>`;

  return [
    { path: "imsmanifest.xml", content: manifestXml },
    { path: "index.html", content: indexHtml },
  ];
}
