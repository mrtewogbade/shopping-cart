import { ObjectId } from "mongoose";

type MetricType = {
  subscribers: Number;
  active_ads: Number;
};
export default interface IModelSettings {
  name: String;
  status: String;
  plan: [{ plan_id: ObjectId; cycle: String; count: Number; price: Number }];
  metric: { MetricType };
  createdAt: Date;
  updatedAt: Date;
}