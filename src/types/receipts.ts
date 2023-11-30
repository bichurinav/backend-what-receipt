import tress from "tress";

export interface IReceipt {
  title: string;
  compositions: string[];
  cooktime: string;
  image: string;
  link: tress.TressJobData;
}

export interface IReceiptMatched extends IReceipt {
  matches: number;
}

type MapCategory = Map<string[], IReceiptMatched[]>;

export interface cacheReceipts {
  goryachie_bliuda: MapCategory;
  salad: MapCategory;
  soup: MapCategory;
  sousy: MapCategory;
  zakuski: MapCategory;
}
