import needle from "needle";
import * as cheerio from "cheerio";
import tress from "tress";
import fs from "fs";
import { IReceipt } from "@/controllers/Receipt/types";

export default class Parser {
  public receipts: IReceipt[] = [];
  private productList: string[] = [];
  private siteURL: string;
  private startURL: string;
  private nameJSON: string;

  constructor(siteURL: string, path: string, nameJSON: string = "data") {
    this.siteURL = siteURL;
    this.startURL = siteURL + path;
    this.nameJSON = nameJSON;
    this.init();
  }

  private init() {
    const siteURL = this.siteURL;
    const receipts = this.receipts;
    const productList = this.productList;

    const q = tress((link, done) => {
      needle("get", link as any)
        .then((res) => {
          const $ = cheerio.load(res.body);

          if (Boolean($(".recipe").length)) {
            $(".recipe").each(function () {
              const $recipe = cheerio.load($(this).html());
              const link = $recipe(".listRecipieTitle").attr("href");
              q.push(`${siteURL}${link}` as any);
            });
          }

          if (Boolean($(".next a").length)) {
            const nextPagePath = $(".next a").attr("href");
            q.push(`${siteURL}${nextPagePath}` as any);
          }

          if (
            Boolean($(".ingredient").length) &&
            Boolean($(".detailed").length)
          ) {
            const receipt = {
              title: $(".detailed").text().trim(),
              compositions: [] as string[],
              cooktime: $(".duration").text().trim(),
              image: $(".photo").eq(0).attr("src"),
              link,
            };

            $(".ingredient").each(function () {
              const $composition = cheerio.load($(this).html());
              const item = $composition(".name").text().trim();
              productList.push(item);
              receipt.compositions.push(item);
            });

            receipts.push(receipt);
          }

          done(null);
        })
        .catch(done);
    }, 10);

    q.drain = () => {
      console.log("!!!FINISHED PARSER!!!");
    };

    q.success = () => {
      fs.writeFileSync(
        `./src/db/${this.nameJSON}.json`,
        JSON.stringify(receipts, null, 4)
      );
      const uniqCompisitionList = [...new Set(productList)].sort((a, b) =>
        a.localeCompare(b)
      );
      fs.writeFileSync(
        `./src/db/products_${this.nameJSON}.json`,
        JSON.stringify(Array.from(uniqCompisitionList), null, 4)
      );
    };

    q.error = (err) => {
      console.log(err);
    };

    q.push(this.startURL as unknown as tress.TressJobData);
  }
}
