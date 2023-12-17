import { Response, Request } from "express";
import { getCollectionDB } from "../../utils/helpers";
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
  async getReceipts(req: Request, res: Response) {
    try {
      const { compositions: compisitionList, mode } = req.query;
      const { category } = req.params;

      if (!categories.includes(category)) {
        res.status(400).json({
          message: `Данная категория не существует: ${category}`,
          data: [],
        });
        return;
      }

      let userCompositions = !Array.isArray(compisitionList)
        ? [compisitionList]
        : compisitionList;

      userCompositions = userCompositions.map((el) => {
        let product = Buffer.from(el as string, "base64");
        return product.toString();
      });

      if (Boolean(userCompositions[0])) {
        const receipts = await getCollectionDB(category);

        if (!receipts) {
          res.status(500).json({
            message: `Ошибка в чтении базы ${category}`,
            data: [],
          });
          return;
        }

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
        return;
      }

      throw new Error(
        `Список продуктов неккоректен: ${JSON.stringify(userCompositions)}`
      );
    } catch (err) {
      res.status(500).json({
        message: err,
        data: [],
      });
      console.error(err);
    }
  }
})();
