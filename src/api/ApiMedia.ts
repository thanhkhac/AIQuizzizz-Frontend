import Api from "@/api/Api";
import type { AxiosProgressEvent } from "axios";

const END_POINTS = {
    PERMISSIONS: "Media/Permissions",
    UPLOAD: "Media/Upload",
};

// video được server transcode nên request upload có thể kéo dài vài phút
const UPLOAD_TIMEOUT_MS = 15 * 60 * 1000;

class ApiMedia {
    GetPermissions = async () => {
        return await Api.get(END_POINTS.PERMISSIONS);
    };

    Upload = async (file: File, onUploadProgress?: (event: AxiosProgressEvent) => void) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.UPLOAD, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: UPLOAD_TIMEOUT_MS,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            onUploadProgress,
        });
    };
}

export default new ApiMedia();
