import { Response, Request } from "express";
import fs from "fs/promises";
import paths from "../../paths";
import { IReceipt, IReceiptMatched } from "./types";
import { getMatchProducts } from "./helpers";

const categories: string[] = [
  "goryachie_bliuda",
  "salad",
  "soup",
  "sousy",
  "zakuski",
];

export default new (class ReceiptController {
  getReceipts(req: Request, res: Response) {
    const { compositions, mode } = req.query;
    const { category } = req.params;

    if (!categories.includes(category)) {
      res.status(400).json({
        message: `Данная категория не существует: ${category}`,
        data: [],
      });
      return;
    }

    const userCompositions = !Array.isArray(compositions)
      ? [compositions]
      : compositions;

    if (Boolean(userCompositions[0])) {
      fs.readFile(paths.db_item(category), {
        encoding: "utf-8",
      })
        .then((jsonData) => {
          const receipts: IReceipt[] = JSON.parse(jsonData);

          const matchedReceipts: IReceiptMatched[] = [];

          receipts.forEach((receipt: IReceipt) => {
            const { matchedCount, matchedProducts } = getMatchProducts(
              userCompositions as string[],
              receipt.compositions
            );

            const addReceipt = () => {
              matchedReceipts.push({
                ...receipt,
                matchedCount,
                matchedProducts,
              });
            };

            if (mode === "strict") {
              if (
                matchedCount !== 0 &&
                receipt.compositions.length - matchedCount < 3
              )
                addReceipt();
            } else {
              if (matchedCount !== 0 && matchedCount > 0) addReceipt();
            }
          });

          const data = matchedReceipts
            .sort((a, b) => b.matchedCount - a.matchedCount)
            .splice(0, 60);

          res.status(200).json({ data, total: data.length });
        })
        .catch((err) => {
          res.status(500).json({
            message: err,
            data: [],
          });
        });
    } else {
      res.status(400).json({
        message: "Query params не массив string[]",
        data: [],
      });
    }
  }
})();
