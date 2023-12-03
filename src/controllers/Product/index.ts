import { Response, Request } from "express";
import fs from "fs/promises";
import paths from "../../paths";
import { searchMatches } from "./helpers";

export default new (class ProductController {
  products: string[];
  dbCollection = "products";

  getProducts(req: Request, res: Response) {
    const { search: searchWord } = req.query;

    if (!searchWord) {
      res.status(400).json({
        message: `Не был передан query param: ?search`,
        data: [],
      });
      return;
    }

    fs.readFile(paths.db_item(this.dbCollection), {
      encoding: "utf-8",
    })
      .then((jsonData) => {
        this.products = JSON.parse(jsonData);
        const result: string[] = searchMatches(
          this.products,
          searchWord as string
        );

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
      })
      .catch(() => {
        res.status(500).json({
          message: `Ошибка в чтении dbCollection: ${this.dbCollection}`,
          data: [],
        });
      });
  }
})();
