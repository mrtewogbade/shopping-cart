import mongoose from "mongoose";

const specSchema = new mongoose.Schema({
  specName: { type: String, required: true },
  required: { type: Boolean, default: false },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
});

// Subcategory schema with dynamic specs
const subcategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  specs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Spec" }],
  // Admin-defined ranking for subcategory display order
  displayRanking: { type: Number, required: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Reference to parent category
  childCategories: [
    { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
  ],
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // Unique ranking for category display
  displayRanking: { type: Number, required: true, unique: true },
  subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }],
  // Recursive reference for child categories (if needed)
  childCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  thumbnail: {
    type: String,
    required: true,
  },
  images: [
    {
      key: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
  ],
});

export const Spec = mongoose.model("Spec", specSchema);
export const SubCategory = mongoose.model("SubCategory", subcategorySchema);

const Category = mongoose.model("Category", categorySchema);
export default Category;