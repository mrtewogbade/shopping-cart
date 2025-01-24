import { z } from "zod";
export const createReviewSchema = z.object({
    comment:z.string({"required_error":"Review message is required"}).min(3,"Review message must be atleast 3 characters long" ),
})