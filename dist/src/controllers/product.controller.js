"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchForProduct = exports.rateStore = exports.newArrivals = exports.fetchAllMyProducts = exports.getSingleProduct = exports.deleteAllProducts = exports.fetchAllProducts = exports.deleteProduct = exports.editProduct = exports.createProduct = void 0;
const catchAsync_1 = __importDefault(require("../errors/catchAsync"));
const product_model_1 = __importDefault(require("../models/product.model"));
const AppResponse_1 = __importDefault(require("../helpers/AppResponse"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const uploadAndDeleteImage_1 = require("../helpers/uploadAndDeleteImage");
const user_model_1 = require("../models/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const fileCheck = req.files;
    if ((fileCheck === null || fileCheck === void 0 ? void 0 : fileCheck.length) == 0) {
        return next(new AppError_1.default("No product images provided", 401));
    }
    if (!fileCheck) {
        return next(new AppError_1.default("No product images provided", 401));
    }
    const { name, description, price, discount, category, location, stock, } = req.body;
    const user = yield user_model_1.Seller.findById(id).select("-password");
    if (!user) {
        return next(new AppError_1.default("Seller not found.", 404));
    }
    const productImages = fileCheck.filter((file) => file.fieldname === "file");
    const uploadedImages = yield (0, uploadAndDeleteImage_1.uploadMedia)(productImages);
    const thumbnail = uploadedImages[0].imageUrl;
    const newProduct = new product_model_1.default({
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
    user === null || user === void 0 ? void 0 : user.store.storeProduct.push(newProduct.id);
    yield newProduct.save();
    yield (user === null || user === void 0 ? void 0 : user.save());
    return (0, AppResponse_1.default)(res, "Product created successfully", 201, newProduct);
}));
// Edit or upadate product
exports.editProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const id = req.user.id;
    const { name, description, price, discount, category, location, tags, sizes, specs, } = req.body;
    // Find the product to edit
    const product = yield product_model_1.default.findById(productId);
    if (!product || product.isDeleted) {
        return next(new AppError_1.default("Product not found or has been deleted", 404));
    }
    if (product.seller != id)
        return next(new AppError_1.default("You can only delete your own product", 400));
}));
exports.deleteProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { productId } = req.params;
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new AppError_1.default("Product not found", 404));
    }
    //Ensure that listing is only deleted by the seller
    if (product.seller != user.id)
        return next(new AppError_1.default("You can only delete your own products.", 404));
    product.isDeleted = true;
    // Delete images from S3
    //Ensure that product id is removed from the user it was pushed to
    const userAccount = yield user_model_1.Seller.findByIdAndUpdate(user.id, {
        $pull: { "store.storeProduct": product.id },
    }, { new: true }).select("-password");
    if (!userAccount)
        return new AppError_1.default("Failed to remove product from users list", 404);
    yield product.save();
    // Delete the product from the database
    return (0, AppResponse_1.default)(res, "Product deleted successfully", 200, null);
}));
exports.fetchAllProducts = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.query, { search, category, storeId, sellerId, location, minPrice, maxPrice, sort = "createdAt", order = "desc", limit = 10, page = 1 } = _a, filters = __rest(_a, ["search", "category", "storeId", "sellerId", "location", "minPrice", "maxPrice", "sort", "order", "limit", "page"]);
    const query = { isDeleted: false };
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
        if (minPrice)
            query.price.$gte = Number(minPrice);
        if (maxPrice)
            query.price.$lte = Number(maxPrice);
    }
    // Add other filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
        if (key && value)
            query[key] = value;
    });
    // Pagination and Sorting
    const sortField = String(sort);
    const sortOrder = order === "asc" ? 1 : -1;
    const limitNumber = Math.max(Number(limit), 1);
    const pageNumber = Math.max(Number(page), 1);
    const skip = (pageNumber - 1) * limitNumber;
    // Fetch products
    const findProduct = yield product_model_1.default.find(query)
        .select("-isDeleted")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNumber)
        .populate("category", "name") // Ensure `name` is available in the Category schema
        .populate("seller", "name"); // Ensure `name` is available in the Seller (User) schema
    // Count total documents
    const totalCount = yield product_model_1.default.countDocuments(query);
    // Response
    return (0, AppResponse_1.default)(res, "All Products fetched successfully", 200, {
        products: findProduct,
        pagination: {
            total: totalCount,
            page: pageNumber,
            pages: Math.ceil(totalCount / limitNumber),
            limit: limitNumber,
        },
    });
}));
exports.deleteAllProducts = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const findProduct = yield product_model_1.default.deleteMany();
    return (0, AppResponse_1.default)(res, "All Product fetched successfully", 200, findProduct);
}));
exports.getSingleProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
    }
    const product = yield product_model_1.default.findById(productId)
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
}));
exports.fetchAllMyProducts = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const productsWithDetails = yield product_model_1.default.aggregate([
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
    return (0, AppResponse_1.default)(res, "Successfully fetched all your products.", 200, productsWithDetails);
}));
exports.newArrivals = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newArrivals = yield product_model_1.default.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(8)
            .select("_id name price thumbnail ratings location");
        return (0, AppResponse_1.default)(res, "New arrivals fetched successfully", 200, newArrivals);
    }
    catch (error) {
        return next(new AppError_1.default("An error occured while fetching new arrivals", 500));
    }
}));
exports.rateStore = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { sellerId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;
    if (!mongoose_1.default.Types.ObjectId.isValid(sellerId)) {
        return next(new AppError_1.default("Invalid seller ID format", 400));
    }
    if (!rating || rating < 1 || rating > 5) {
        return next(new AppError_1.default("Rating must be between 1 and 5", 400));
    }
    const seller = yield user_model_1.Seller.findById(sellerId);
    if (!seller || !seller.store) {
        return next(new AppError_1.default("Seller store not found", 404));
    }
    const existingRatingIndex = seller.store.ratings.findIndex((r) => r.user.toString() === userId.toString());
    if (existingRatingIndex > -1) {
        seller.store.ratings[existingRatingIndex].rating = rating;
    }
    else {
        seller.store.ratings.push({
            user: userId,
            rating,
        });
    }
    yield seller.save();
    return (0, AppResponse_1.default)(res, "Rating submitted successfully", 200, {
        averageRating: seller.store.rating,
        totalRatings: seller.store.ratings.length,
    });
}));
exports.SearchForProduct = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category, tags, minPrice, maxPrice, location, minRating, sort = "-createdAt", page = 1, limit = 10, } = req.query;
    const filters = {
        isDeleted: false,
    };
    if (name) {
        filters.name = { $regex: new RegExp(name, "i") };
    }
    if (category) {
        filters.category = category;
    }
    if (tags) {
        const tagsArray = tags.split(",");
        filters.tags = { $in: tagsArray };
    }
    if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice)
            filters.price.$gte = parseFloat(minPrice);
        if (maxPrice)
            filters.price.$lte = parseFloat(maxPrice);
    }
    if (location) {
        filters.location = location;
    }
    if (minRating) {
        filters.rating = { $gte: parseFloat(minRating) };
    }
    const currentPage = parseInt(page, 10);
    const perPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * perPage;
    const totalProducts = yield product_model_1.default.countDocuments(filters);
    const products = yield product_model_1.default.find(filters)
        .select("-isDeleted") // Exclude sensitive fields if necessary
        .populate("seller", "name")
        .populate("reviews")
        .sort(sort)
        .skip(skip)
        .limit(perPage);
    // Respond with data
    return (0, AppResponse_1.default)(res, "Products have been found", 200, {
        total: totalProducts,
        currentPage,
        totalPages: Math.ceil(totalProducts / perPage),
        products,
    });
}));
