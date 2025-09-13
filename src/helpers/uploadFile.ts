import { trpc } from "@/lib/trpc";

export function useUploadFile() {
  const utils = trpc.useUtils();

  const uploadFile = async (
    file: File | Blob,
    caseId: string,
    fileName?: string,
    fileType?: string
  ) => {
    try {
      const name = file instanceof File ? file.name : fileName ?? "encrypted.bin";
      const type = file instanceof File ? file.type : fileType ?? "application/octet-stream";

      const { url, storageKey } = await utils.upload.getUploadUrl.fetch({
        fileName: name,
        fileType: type,
        caseId: caseId,
      });

      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": type,
        },
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      console.log("✅ File uploaded!");
      return { success: true, url, storageKey };
    } catch (error) {
      console.error("❌ Upload failed:", error);
      return { success: false, error };
    }
  };

  return { uploadFile };
}
