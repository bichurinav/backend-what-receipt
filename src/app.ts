import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import cors from "cors";
import { searchMatches } from "./utils/helpers";
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
    ],
  })
);

const port = process.env.PORT;

// Временное решение
// TODO: реализовать через MongoDB
const cacheReceipts: cacheReceipts = {
  goryachie_bliuda: new Map(),
  salad: new Map(),
  soup: new Map(),
  sousy: new Map(),
  zakuski: new Map(),
};

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

      const data = result.filter((composition) => {
        return composition.match(new RegExp(searchWord as string, "ig"));
      });

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
  const { compositions } = req.query;
  const { category } = req.params;

  if (!cacheReceipts[category]) {
    res.status(400).json({
      message: `Данная категория не существует: ${category}`,
      data: [],
    });
    return;
  }

  if (Array.isArray(compositions) && Boolean(compositions)) {
    if (cacheReceipts[category].has(compositions.join(""))) {
      res
        .status(200)
        .json({ data: cacheReceipts[category].get(compositions.join("")) });
      return;
    }

    fs.readFile(path.join(pathes.db, `${category}.json`), {
      encoding: "utf-8",
    })
      .then((jsonData) => {
        const receipts: IReceipt[] = JSON.parse(jsonData);

        const matchesReceipts: IReceiptMatched[] = [];

        receipts.forEach((receipt: IReceipt) => {
          let matches = 0;
          const copyCompositions = [...compositions] as string[];

          while (copyCompositions.length !== 0) {
            let value = copyCompositions.pop();
            value = [...value].slice(0, -1).join("");
            receipt.compositions.forEach((c) => {
              const composition = [...c].slice(0, -1).join("");
              if (Array.isArray(composition.match(new RegExp(value, "ig")))) {
                matches += 1;
              }
            });
          }

          if (matches > 1) {
            matchesReceipts.push({ ...receipt, matches });
          }
        });

        const data = matchesReceipts
          .sort((a, b) => b.matches - a.matches)
          .splice(0, 60);

        cacheReceipts[category].set(compositions.join(""), data);

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
