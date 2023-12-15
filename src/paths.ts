import path from "path";

const rootPath = path.resolve();

export default {
  src: path.join(rootPath, "src"),
  db_item: (itemName: string) => path.join(rootPath, "db", `${itemName}.json`),
};
