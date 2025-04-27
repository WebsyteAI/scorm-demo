import { generateScormFiles, ScormLessonInput } from "../domain/scorm/services/ScormPackageService";
import { createZip } from "../infrastructure/ZipUtil";

export async function generateScormAsset(input: ScormLessonInput): Promise<Uint8Array> {
  const files = generateScormFiles(input);
  const zip = await createZip(files);
  return zip;
}
