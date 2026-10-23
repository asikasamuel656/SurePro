import { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinary";

export default function CloudinaryTest() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  async function handleUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);
    setError("");
    setImageUrl("");

    try {
      const result = await uploadToCloudinary(file);

      console.log("Cloudinary result:", result);

      setImageUrl(result.url);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
      />

      {uploading && <p>Uploading...</p>}

      {error && <p>{error}</p>}

      {imageUrl && (
        <div>
          <p>Upload successful!</p>

          <img
            src={imageUrl}
            alt="Uploaded"
            style={{ width: 300 }}
          />

          <p>{imageUrl}</p>
        </div>
      )}
    </div>
  );
}