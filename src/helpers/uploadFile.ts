import { trpc } from "@/lib/trpc";

export function useUploadFile() {
  const utils = trpc.useUtils();

  const uploadFile = async (file: File, caseId: string) => {
    try {
    
      const { url, storageKey } = await utils.upload.getUploadUrl.fetch({
        fileName: file.name,
        fileType: file.type,
        caseId: caseId,
      });

  
      const response = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
     
        mode: 'cors',
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