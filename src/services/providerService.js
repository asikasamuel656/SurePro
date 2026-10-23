import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function saveProviderProfileImage(
  providerId,
  imageUrl,
  imagePublicId
) {
  const providerRef = doc(db, "providers", providerId);

  await updateDoc(providerRef, {
    profileImageUrl: imageUrl,
    profileImagePublicId: imagePublicId,
    updatedAt: serverTimestamp(),
  });
}