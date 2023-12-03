import tress from "tress";

export interface IReceipt {
  title: string;
  compositions: string[];
  cooktime: string;
  image: string;
  link: tress.TressJobData;
}

export interface IReceiptMatched extends IReceipt {
  matchedCount: number;
  matchedProducts: string[] | [];
}
