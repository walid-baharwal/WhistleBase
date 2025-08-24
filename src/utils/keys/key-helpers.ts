export function mergeKeys(publicKey: string, privateKey: string): string {
  const publicKeyLength = publicKey.length.toString().padStart(3, "0");

  return publicKeyLength + publicKey + privateKey;
}

export function unmergeKeys(mergedKey: string): {
  publicKey: string;
  privateKey: string;
} | null {
  try {
    const publicKeyLength = parseInt(mergedKey.slice(0, 3), 10);

    const publicKey = mergedKey.slice(3, 3 + publicKeyLength);

    const privateKey = mergedKey.slice(3 + publicKeyLength);

    if (publicKey && privateKey) {
      return {
        publicKey,
        privateKey,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function generateCaseAccessKey(
  caseId: string,
  publicKey: string,
  privateKey: string
): string {
  return mergeKeys(publicKey + caseId, privateKey);
}

export function formatKeyForDisplay(mergedKey: string): string {
  return mergedKey;
}

export function validateMergedKey(mergedKey: string): boolean {
  const unmerged = unmergeKeys(mergedKey);
  return unmerged !== null && unmerged.publicKey.length > 0 && unmerged.privateKey.length > 0;
}

export function createKeyDownloadContent(
  mergedKey: string,
  caseId: string,
  channelTitle: string,
  accessCode: string
): string {
  const timestamp = new Date().toISOString();

  return `WhistleBase Case Reference
========================

Channel: ${channelTitle}
Case ID: ${caseId}
Access Code: ${accessCode}
Reference Key: ${mergedKey}
Created: ${timestamp}

IMPORTANT SECURITY NOTICE:
- Save this reference key securely
- You will need it to check your case status
- Do not share this key with others
- WhistleBase cannot recover this key if lost

This key ensures your anonymity while allowing you to track your case.
`;
}
