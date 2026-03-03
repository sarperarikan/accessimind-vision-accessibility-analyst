export class FileService {
    static async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = reader.result as string;
                // Remove the data area prefix (e.g., "data:video/mp4;base64,")
                resolve(base64String.split(',')[1]);
            };
            reader.onerror = (error) => reject(error);
        });
    }
}
