// Minimal zip utility using JSZip (assume available in nodejs_compat)
import JSZip from "jszip";
import { ScormFile } from "../domain/scorm/services/ScormPackageService";

export async function createZip(files: ScormFile[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  const content = await zip.generateAsync({ type: "uint8array" });
  return content;
}
