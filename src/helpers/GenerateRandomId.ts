import crypto from "crypto";

const GenerateRandomId = () => {
  const randomSegment = crypto.randomBytes(4).toString("hex");
  const dateSegment = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${dateSegment}${randomSegment}`;
};
export default GenerateRandomId;

export const generateRandomAlphanumeric = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};


export const generateUniqueOrderTracker = () =>{
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const minLength = 3;
  const maxLength = 5;
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  let randomString = '';
  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
  }
  
  // Combine with a timestamp
  const timestamp = Date.now().toString(36); // Convert timestamp to base36 to shorten it
  const uniqueString = randomString + timestamp;
  
  // If you need exactly 6 to 8 characters, you can hash the string or slice it
  return uniqueString.slice(0, 8); // Ensures it stays within 6-8 characters
}

const uniqueString = generateUniqueOrderTracker();
console.log(uniqueString); // Example output: "aB7dE2f5"
