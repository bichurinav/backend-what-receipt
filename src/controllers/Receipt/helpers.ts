export const getMatchProducts = (
  userCompositions: string[],
  receiptCompositions: string[]
): { matchedCount: number; matchedProducts: string[] } => {
  let matchedCount = 0;
  const matchedProducts: string[] = [];
  const compositions = [...userCompositions] as string[];

  while (compositions.length !== 0) {
    let userComposition = compositions.pop();

    const wordsUserComposition = userComposition.split(" ");

    receiptCompositions.forEach((receiptComposition) => {
      if (
        receiptComposition.match(/\,|\sили\s|\sи\s/g) &&
        Array.isArray(
          receiptComposition.match(new RegExp(userComposition, "ig"))
        )
      ) {
        matchedCount += 1;
        matchedProducts.push(receiptComposition);
        return;
      }

      if (
        wordsUserComposition.length === 2 &&
        Array.isArray(
          receiptComposition.match(
            new RegExp(
              `${wordsUserComposition[0]}\\s${wordsUserComposition[1]}|${wordsUserComposition[1]}\\s${wordsUserComposition[0]}`,
              "i"
            )
          )
        )
      ) {
        matchedCount += 1;
        matchedProducts.push(receiptComposition);
        return;
      }

      if (wordsUserComposition.length === 3) {
        const strReg =
          `${wordsUserComposition[0]}\\s${wordsUserComposition[1]}\\s${wordsUserComposition[2]}|
        ${wordsUserComposition[1]}\\s${wordsUserComposition[0]}\\s${wordsUserComposition[2]}|
        ${wordsUserComposition[2]}\\s${wordsUserComposition[1]}\\s${wordsUserComposition[0]}|
        ${wordsUserComposition[2]}\\s${wordsUserComposition[0]}\\s${wordsUserComposition[1]}|
        ${wordsUserComposition[1]}\\s${wordsUserComposition[2]}\\s${wordsUserComposition[0]}|
        `.replace(/\n|\s/g, "");
        if (Array.isArray(receiptComposition.match(new RegExp(strReg, "ig")))) {
          matchedCount += 1;
          matchedProducts.push(receiptComposition);
        }
        return;
      }

      if (
        Array.isArray(
          receiptComposition.match(
            new RegExp(`^(.+?\\s)?${userComposition}(\\s+.+)?$`, "i")
          )
        )
      ) {
        matchedCount += 1;
        matchedProducts.push(receiptComposition);
        return;
      }
    });
  }

  return {
    matchedCount,
    matchedProducts,
  };
};
