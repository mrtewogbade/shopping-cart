import mongoose from "mongoose";
import { Document, ObjectId, Schema } from "mongoose";

export interface ISubscription {
  name: String;
  price: Number;
  metric: { MetricType };
  status: String;
  type: String[];
  available_num_product: Number;
  metricsCount: {
    click: Number;
    view: Number;
    action: Number;
  };
  allowed_metrics:{
    click:Boolean;
    action:Boolean;
    view:Boolean;
    all:Boolean
  }
  cycle: String;
  expiryDate: String;
  startTime: String; // Start time in "4:00 PM" format
  closeTime: String;
  createdAt: Date;
  updatedAt: Date;
  isAvailable: Boolean;
}

type MetricType = {
  subscribers: Number;
  active_ads: Number;
};