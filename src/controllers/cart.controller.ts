import { Request, Response, NextFunction } from "express";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import AppError from "../errors/AppError";
import { IUser } from "../interfaces/IUser";
import Cart from "../models/cart.model";
import { Buyer, User } from "../models/user.model";


export const AddToCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const { quantity } = req.body; // Accept quantity from the request body
    const buyerId = (req.user as IUser).id;
    let user: any = await User.findById(buyerId)
      .select(
        "-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires "
      )
      .exec();
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let cart = await Cart.findOne({ _id: user?.cart, isDeleted: false }).exec();
    if (!cart) {
      cart = new Cart({
        buyerId,
        carts: [],
        isPurchased: false,
      });
    }

    const existingCartItem: any = cart.carts.find(
      (item: any) => item.product.toString() === productId
    );

    if (existingCartItem) {
     
      if (quantity && quantity > 0) {
        existingCartItem.quantity += quantity; 
      } else {
        existingCartItem.quantity += 1;
      }
    } else {
      
      cart.carts.push({ product: productId, quantity: quantity && quantity > 0 ? quantity : 1 });
    }

    if (user.cart != cart._id) {
      user.cart = cart._id;
      await cart.save();
      await user.save();
    }

    cart = await cart.populate({
      path: "carts.product",
      select: "name price thumbnail",
    });

    return AppResponse(res, "User has added to cart successfully", 200, {
      user,
      cart,
    });
  }
);


export const RemoveFromCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;

    const buyerId = (req.user as IUser).id;
    //Both of this should run at same time.
    let user: any = await User.findById(buyerId)
      .select(
        "-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires "
      )
      .exec();
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let cart = await Cart.findOne({ _id: user?.cart, isDeleted: false }).exec();

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    const existingCartItem = cart.carts.find(
      (item: any) => item.product.toString() === productId
    );
    if (!existingCartItem) {
      return next(new AppError("Product not found in cart", 404));
    }

    existingCartItem.quantity -= 1;
    if (existingCartItem.quantity === 0) {
      cart.carts = cart.carts.filter(
        (item: any) => item.product.toString() !== productId
      );
      user.cart = null;
    }

    await cart.save();
    await user.save();
    cart = await cart.populate({
      path: "carts.product",
      select: "name price thumbnail",
    });
    return AppResponse(res, "User has removed from cart successfully", 200, {
      user,
      cart,
    });
  }
);

export const ClearCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const buyerId = (req.user as IUser).id;

    let user: any = await User.findById(buyerId)
      .select(
        "-password -isEmailVerified -otp -is_two_factor_enabled -otpExpires "
      )
      .exec();
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let cart = await Cart.findOne({ _id: user?.cart, isDeleted: false }).exec();

    if (!cart) {
      return next(new AppError("Cart not found", 404));
    }

    cart.isDeleted = true;
    user.cart = null;

    await Promise.all([cart.save(), user.save()]);

    return AppResponse(res, "Cart has been cleared successfully", 200, {
      user,
    });
  }
);

export const FetchAllCarts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const carts = await Cart.find({ isDeleted: false });
    return AppResponse(res, "All Carts fetched successfully", 200, carts);
  }
);

export const FetchSingleUserCart = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
const userId = (req.user as IUser).id;
    const user = await Buyer.findById(userId)
      .select(
        "-password -isDeleted -otp -otpExpires -is_two_factor_enabled -isEmailVerified"
      )
      .populate({
        path: "cart",
        select: "-buyerId -isPurchased",
        populate: {
          path: "carts.product",
          model: "Product",
          select:
            "-seller -discount -createdAt  -tags -location -sizes -reviews -ratings -description -category -images",
        },
      });
    console.log(user);
    if (!user) return next(new AppError("User does not exist", 404));
    const cart = user.cart;
    if (!cart)
      return next(
        new AppError("User does not have a cart. Please start shopping.", 404)
      );

    return AppResponse(res, "Users Carts fetched successfully", 200, cart);
  }
);
