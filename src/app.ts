import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import ReceiptConstroller from "./controllers/Receipt";
import ProductController from "./controllers/Product";
// import ParserPovar from "./modules/parser/ParserPovar";

dotenv.config();

const app: Express = express();

const port = process.env.PORT;
const portClient = process.env.PORT_CLIENT;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      `http://localhost:${portClient}`,
      `http://185.104.249.100:${portClient}`,
    ],
  })
);

// new ParserPovar("https://povar.ru", "/list/sousy/", "sousy");

app.get("/api/products", ProductController.getProducts);
app.get("/api/receipts/:category", ReceiptConstroller.getReceipts);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
