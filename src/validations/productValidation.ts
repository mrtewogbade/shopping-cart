import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string({ required_error: "Product name is required" }).min(3, "Product name must be at least 3 characters long"),
    description: z.string({ required_error: "Product description is required" }).min(10, "Product description must be at least 10 characters long"),
    price: z.string({ required_error: "Product price is required" })
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val) && val > 0, { message: "Product price must be a positive number." }),
    location: z.string({ required_error: "Product location is required" }).min(3, "Product location must be at least 3 characters long"),
    category: z.string({ required_error: "Product category is required" }).min(3, "Product category must be at least 3 characters long"),
    tags: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    discount: z.string({ required_error: "Product discount is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, { message: "Product discount must be a positive number." }).optional(),
});

export const ratingProductSchema = z.object({
    rating:z.string({ required_error: "Product rating is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, { message: "Product rating must be a positive number." }),
});