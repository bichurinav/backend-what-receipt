import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import cors from "cors";
import { searchMatches, getCountMatchProducts } from "./utils/helpers";
import { IReceipt, IReceiptMatched, cacheReceipts } from "./types/receipts";
// import ParserPovar from "./modules/parser/ParserPovar";

dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3100",
      "http://185.104.249.100:3100",
    ],
  })
);

const port = process.env.PORT;

const rootPath = path.resolve();

const pathes = {
  src: path.join(rootPath, "src"),
  db: path.join(rootPath, "src", "db_receipts"),
};

// new ParserPovar("https://povar.ru", "/list/sousy/", "sousy");

app.get("/api/compositions", async (req: Request, res: Response) => {
  try {
    const { search: searchWord } = req.query;

    if (searchWord) {
      let jsonData = await fs.readFile(
        path.join(pathes.db, "compositions.json"),
        {
          encoding: "utf-8",
        }
      );

      const compositions = JSON.parse(jsonData);

      const result = searchMatches(compositions, searchWord as string);

      let data = result.filter((composition) => {
        return composition.match(
          new RegExp(`^(.+?\\s)?${searchWord}(\\s+.+)?$`, "i")
        );
      });

      if (!data.length) {
        data = result.filter((composition) => {
          return composition.match(new RegExp(searchWord as string, "i"));
        });
      }

      res.status(200).json({ data, total: data.length });
    } else {
      throw "Не был передан query param: ?search";
    }
  } catch (err) {
    res.status(400).json({
      message: err,
      data: [],
    });
  }
});

app.get("/api/receipts/:category", (req: Request, res: Response) => {
  const { compositions, mode } = req.query;
  const { category } = req.params;
  const categories = ["goryachie_bliuda", "salad", "soup", "sousy", "zakuski"];

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
    fs.readFile(path.join(pathes.db, `${category}.json`), {
      encoding: "utf-8",
    })
      .then((jsonData) => {
        const receipts: IReceipt[] = JSON.parse(jsonData);

        const matchesReceipts: IReceiptMatched[] = [];

        receipts.forEach((receipt: IReceipt) => {
          const matches = getCountMatchProducts(
            userCompositions as string[],
            receipt.compositions
          );

          if (mode === "strict") {
            if (matches !== 0 && receipt.compositions.length - matches < 3)
              matchesReceipts.push({ ...receipt, matches });
          } else {
            if (matches !== 0 && matches > 0)
              matchesReceipts.push({ ...receipt, matches });
          }
        });

        const data = matchesReceipts
          .sort((a, b) => b.matches - a.matches)
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
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
