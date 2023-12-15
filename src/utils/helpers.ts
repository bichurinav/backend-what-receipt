import fs from "fs/promises";
import path from "path";

export const getCollectionDB = (collectionName: string): Promise<null | []> => {
  const dbPath = path.join(path.resolve(), "db", `${collectionName}.json`);
  return new Promise((res, rej) => {
    fs.readFile(dbPath, {
      encoding: "utf-8",
    })
      .then((jsonData) => {
        const items = JSON.parse(jsonData);
        if (!items && items.length === 0) {
          rej(null);
          return;
        }
        res(items);
      })
      .catch((err) => {
        rej(err);
      });
  });
};
