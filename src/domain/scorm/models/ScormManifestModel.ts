export interface ScormOrganizationItem {
  identifier: string;
  title: string;
  href: string;
}

export interface ScormManifest {
  identifier: string;
  title: string;
  items: ScormOrganizationItem[];
}

export function generateManifestXML(manifest: ScormManifest): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${manifest.identifier}" version="1.2"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <organizations default="ORG1">
    <organization identifier="ORG1">
      <title>${manifest.title}</title>
      ${manifest.items
        .map(
          (item) => `<item identifier="${item.identifier}" identifierref="RES1">
        <title>${item.title}</title>
      </item>`
        )
        .join("\n")}
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES1" type="webcontent" adlcp:scormtype="sco" href="${manifest.items[0].href}">
      <file href="${manifest.items[0].href}" />
    </resource>
  </resources>
</manifest>`;
}
