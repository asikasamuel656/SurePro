import { useState } from "react";
import { uploadToCloudinary } from "../services/cloudinary";
import { saveProviderProfileImage } from "../services/providerService";
import { auth } from "../firebase/firebase";

function ProfileImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      setUploading(true);

      // 1. Upload image to Cloudinary
      const result = await uploadToCloudinary(file);

      // 2. Save Cloudinary information to Firestore
      await saveProviderProfileImage(
        user.uid,
        result.url,
        result.publicId
      );

      // 3. Update UI
      setImageUrl(result.url);

      console.log("Provider image saved successfully.");
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload profile image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleImageUpload}
      />

      {uploading && <p>Uploading...</p>}

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Provider profile"
          width={150}
          height={150}
        />
      )}
    </div>
  );
}

export default ProfileImageUpload;