// src/helpers/uploadAndDeleteImage.ts
import storage from "../config/firebase.config";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import GenerateRandomId from "./GenerateRandomId";
import dotenv from "dotenv";

dotenv.config();

export const uploadMedia = async (
  files: Express.Multer.File[]
): Promise<{ imageUrl: string; key: string }[]> => {
  
  const uploadPromises = files.map(async (file, index) => {
    const randomPrefix = GenerateRandomId();
    const key = `${randomPrefix}-${index}`; // Preserve the original file name extension
    const storageRef = ref(storage, key);

    try {
      await uploadBytes(storageRef, file.buffer, {
        contentType: file.mimetype,
      });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${
        process.env.FIREBASE_STORAGE_BUCKET
      }/o/${encodeURIComponent(key)}?alt=media`;
      return { imageUrl, key };
    } catch (err) {
      console.log(err)
      throw new Error(
        `Could not upload file ${file.originalname} to Firebase Storage: ${err}`
      );
    }
  });

  try {
    return await Promise.all(uploadPromises);
  } catch (err) {
    console.error("Error uploading files:", err);
    throw new Error("Failed to upload all files.");
  }
};




export const deleteImage = async (keys: string[]): Promise<void> => {
  const deletePromises = keys.map(async (key) => {
    const storageRef = ref(storage, key);
    try {
      await deleteObject(storageRef);
      console.log(`File deleted successfully: ${key}`);
      return true
    } catch (error) {
      console.error(`Could not delete file from Firebase Storage: ${error}`);
      throw new Error(`Could not delete file from Firebase Storage: ${error}`);
    }
  });

  try {
    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting files:", error);
    throw new Error("Could not delete one or more files from Firebase Storage");
  }
};
