import { Response, Request } from "express";
import { getCollectionDB } from "../../utils/helpers";
import { searchMatches } from "./helpers";

const COLLECTION_NAME = "products";

export default new (class ProductController {
  async getProducts(req: Request, res: Response) {
    try {
      const { search: searchWord } = req.query;

      if (!searchWord) {
        res.status(400).json({
          message: `Не был передан query param: ?search`,
          data: [],
        });
        return;
      }

      const products = await getCollectionDB(COLLECTION_NAME);

      if (!products) {
        res.status(500).json({
          message: `Ошибка в чтении базы продуктов`,
          data: [],
        });
        return;
      }

      const result: string[] = searchMatches(products, searchWord as string);

      let data = result.filter((products: string) => {
        return products.match(
          new RegExp(`^(.+?\\s)?${searchWord}(\\s+.+)?$`, "i")
        );
      });

      if (!data.length) {
        data = result.filter((products: string) => {
          return products.match(new RegExp(searchWord as string, "i"));
        });
      }

      res.status(200).json({ data, total: data.length });
    } catch (err) {
      res.status(500).json({
        message: err,
        data: [],
      });
      console.error(err);
    }
  }
})();
