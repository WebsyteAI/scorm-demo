import { createZip } from "../infrastructure/ZipUtil";
import { ScormLessonInput, generateScormFilesAI } from "../domain/scorm/services/ScormPackageService";

// Updated: env must be passed in for AI
export async function generateScormAsset(input: ScormLessonInput, env: any): Promise<Uint8Array> {
  const files = await generateScormFilesAI(input, env);
  const zip = await createZip(files);
  return zip;
}
