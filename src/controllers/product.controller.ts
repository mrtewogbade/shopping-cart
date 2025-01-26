import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import Product from "../models/product.model";
import AppResponse from "../helpers/AppResponse";
import AppError from "../errors/AppError";
import { ISeller, IUser } from "../interfaces/IUser";
import { deleteImage, uploadMedia } from "../helpers/uploadAndDeleteImage";
import { Seller, User } from "../models/user.model";
import mongoose from "mongoose";

export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = (req.user as IUser).id;

    const fileCheck: any = req.files;
    if (fileCheck?.length == 0) {
      return next(new AppError("No product images provided", 401));
    }
    if (!fileCheck) {
      return next(new AppError("No product images provided", 401));
    }
    const {
      name,
      description,
      price,
      discount,
      category,
      location,
   
      stock,
    } = req.body;

    const user: any = await Seller.findById(id).select("-password");
    if (!user) {
      return next(new AppError("Seller not found.", 404));
    }

    const productImages = fileCheck.filter(
      (file: any) => file.fieldname === "file"
    );
      

    const uploadedImages = await uploadMedia(
      productImages as Express.Multer.File[]
    );

    const thumbnail = uploadedImages[0].imageUrl;

    const newProduct = new Product({
      seller: id,
      name,
      description,
      price,
      discount,
      location,
      category,
      thumbnail,
      images: uploadedImages,
      stock,

    });

    user?.store.storeProduct.push(newProduct.id);

    await newProduct.save();
    await user?.save();

    return AppResponse(res, "Product created successfully", 201, newProduct);
  }
);

// Edit or upadate product

export const editProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const id = (req.user as IUser).id;
    const {
      name,
      description,
      price,
      discount,
      category,
      location,
      tags,
      sizes,
      specs,
    } = req.body;

    // Find the product to edit
    const product = await Product.findById(productId);
    if (!product || product.isDeleted) {
      return next(new AppError("Product not found or has been deleted", 404));
    }
    if (product.seller != id)
      return next(new AppError("You can only delete your own product", 400));

  }
);

export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as ISeller;
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Product not found", 404));
    }
    //Ensure that listing is only deleted by the seller
    if (product.seller != user.id)
      return next(new AppError("You can only delete your own products.", 404));

    product.isDeleted = true;

    // Delete images from S3
    //Ensure that product id is removed from the user it was pushed to
    const userAccount = await Seller.findByIdAndUpdate(
      user.id,
      {
        $pull: { "store.storeProduct": product.id },
      },
      { new: true }
    ).select("-password");
    if (!userAccount)
      return new AppError("Failed to remove product from users list", 404);
    await product.save();
    // Delete the product from the database

    return AppResponse(res, "Product deleted successfully", 200, null);
  }
);

export const fetchAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      search,
      category,
      storeId,
      sellerId,
      location,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      limit = 10,
      page = 1,
      ...filters
    } = req.query;

    const query: Record<string, any> = { isDeleted: false };

    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Add category filter
    if (category) {
      query.category = category; // Ensure category is an ObjectId if stored as such
    }

    // Add store filter
    if (storeId) {
      query["seller.store"] = storeId;
    }

    // Add seller filter
    if (sellerId) {
      query.seller = sellerId;
    }

    // Add location filter (supports regex for partial matching)
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Add price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Add other filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (key && value) query[key] = value;
    });

    // Pagination and Sorting
    const sortField = String(sort);
    const sortOrder = order === "asc" ? 1 : -1;
    const limitNumber = Math.max(Number(limit), 1);
    const pageNumber = Math.max(Number(page), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch products
    const findProduct = await Product.find(query)
      .select("-isDeleted")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNumber)
      .populate("category", "name") // Ensure `name` is available in the Category schema
      .populate("seller", "name"); // Ensure `name` is available in the Seller (User) schema

    // Count total documents
    const totalCount = await Product.countDocuments(query);

    // Response
    return AppResponse(res, "All Products fetched successfully", 200, {
      products: findProduct,
      pagination: {
        total: totalCount,
        page: pageNumber,
        pages: Math.ceil(totalCount / limitNumber),
        limit: limitNumber,
      },
    });
  }
);

export const deleteAllProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const findProduct = await Product.deleteMany();
    return AppResponse(
      res,
      "All Product fetched successfully",
      200,
      findProduct
    );
  }
);


export const getSingleProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId)
      .populate({
        path: "seller",
        select: "-password -otp -otpExpires", // Exclude sensitive fields
        populate: {
          path: "store",
          select: "-_id -__v", // Customize fields to include/exclude
        },
      })
      .exec();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  }
);



export const fetchAllMyProducts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const productsWithDetails = await Product.aggregate([
      // Match products belonging to the seller
      { $match: { seller: user._id, isDeleted: false } },
      // Lookup sales data from the Cart collection
      {
        $lookup: {
          from: "carts",
          let: { productId: "$_id" },
          pipeline: [
            { $unwind: "$carts" }, // Unwind the carts array
            { $match: { $expr: { $eq: ["$carts.product", "$$productId"] } } },
            { $group: { _id: null, totalSales: { $sum: "$carts.quantity" } } },
          ],
          as: "salesData",
        },
      },
      // Add the sales count
      {
        $addFields: {
          totalSales: {
            $ifNull: [{ $arrayElemAt: ["$salesData.totalSales", 0] }, 0],
          },
        },
      },
      // Add the total earnings
      {
        $addFields: {
          total_earnings: { $multiply: ["$totalSales", "$price"] },
        },
      },
      // Remove the salesData array
      { $project: { salesData: 0 } },
      // Lookup reviews data from the Review collection
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviewData",
        },
      },
      // Add a field to count the replies in each review
      {
        $addFields: {
          reviewCount: {
            $reduce: {
              input: "$reviewData.reviews",
              initialValue: 0,
              in: { $add: ["$$value", { $size: "$$this" }] },
            },
          },
        },
      },
      // Final projection to clean up fields
      {
        $project: {
          _id: 1,
          //seller: 1,
          name: 1,
          description: 1,
          price: 1,
          discount: 1,
          category: 1,
          thumbnail: 1,
          views: 1, // Ensure views is included
          totalSales: 1,
          reviews: 1,
          total_earnings: 1, // Include total earnings
          createdAt: 1,
          reviewCount: { $ifNull: ["$reviewCount", 0] },
        },
      },
    ]);

    return AppResponse(
      res,
      "Successfully fetched all your products.",
      200,
      productsWithDetails
    );
  }
);




export const newArrivals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newArrivals = await Product.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id name price thumbnail ratings location");

      return AppResponse(
        res,
        "New arrivals fetched successfully",
        200,
        newArrivals
      );
    } catch (error) {
      return next(
        new AppError("An error occured while fetching new arrivals", 500)
      );
    }
  }
);




export const rateStore = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sellerId } = req.params;
    const { rating } = req.body;
    const userId = (req.user as IUser).id;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return next(new AppError("Invalid seller ID format", 400));
    }

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError("Rating must be between 1 and 5", 400));
    }

    const seller = await Seller.findById(sellerId);

    if (!seller || !seller.store) {
      return next(new AppError("Seller store not found", 404));
    }

    const existingRatingIndex = seller.store.ratings.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingRatingIndex > -1) {

      seller.store.ratings[existingRatingIndex].rating = rating;
    } else {
   
      seller.store.ratings.push({
        user: userId,
        rating,
      });
    }

    await seller.save();

    return AppResponse(res, "Rating submitted successfully", 200, {
      averageRating: seller.store.rating,
      totalRatings: seller.store.ratings.length,
    });
  }
);




export const SearchForProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      name,
      category,
      tags,
      minPrice,
      maxPrice,
      location,
      minRating,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    const filters: any = {
      isDeleted: false,
    };

    if (name) {
      filters.name = { $regex: new RegExp(name as string, "i") };
    }

    if (category) {
      filters.category = category;
    }

    if (tags) {
      const tagsArray = (tags as string).split(",");
      filters.tags = { $in: tagsArray };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice as string);
    }

    if (location) {
      filters.location = location;
    }

    if (minRating) {
      filters.rating = { $gte: parseFloat(minRating as string) };
    }

    const currentPage = parseInt(page as string, 10);
    const perPage = parseInt(limit as string, 10);
    const skip = (currentPage - 1) * perPage;

    const totalProducts = await Product.countDocuments(filters);

    const products = await Product.find(filters)
      .select("-isDeleted") // Exclude sensitive fields if necessary
      .populate("seller", "name")
      .populate("reviews")
      .sort(sort as string)
      .skip(skip)
      .limit(perPage);

    // Respond with data
    return AppResponse(res, "Products have been found", 200, {
      total: totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / perPage),
      products,
    });
  }
);
