export const searchMatches = (array: string[] = [], el: string) => {
  let start = 0;
  let end = array.length - 1;

  let result: string[] = [];

  const getNeededChar = (str: string, count: number = 3) => {
    return [...str].slice(0, count).join("").toLowerCase();
  };

  while (result.length === 0 && start <= end) {
    let middle = Math.floor((start + end) / 2);

    const a = getNeededChar(el);
    const b = getNeededChar(array[middle]);

    if (a === b) {
      let startedSlice = 0;
      let endedSlice = 0;
      let s = 1;
      let e = 1;

      while (s > 0) {
        if (
          array[middle - s] &&
          getNeededChar(array[middle - s]) === getNeededChar(a)
        ) {
          s += 1;
        } else {
          startedSlice = s === 1 ? middle : middle - s + 1;
          s = 0;
          break;
        }
      }
      while (e > 0) {
        if (
          array[middle + e] &&
          getNeededChar(array[middle + e]) === getNeededChar(a)
        ) {
          e += 1;
        } else {
          endedSlice = e === 1 ? middle + 1 : middle + e;
          e = 0;
          break;
        }
      }

      result =
        startedSlice === endedSlice
          ? [array[middle]]
          : array.slice(startedSlice, endedSlice);

      break;
    } else if (a > b) {
      start = middle + 1;
    } else {
      end = middle - 1;
    }
  }

  return result;
};

// export const cutLastChars = (str: string, countCut: number = 1): string => {
//   if (typeof str !== "string") return str;
//   return [...str].slice(0, -countCut).join("");
// };

export const getCountMatchProducts = (
  userCompositions: string[],
  receiptCompositions: string[]
): number => {
  let matches = 0;
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
        matches += 1;
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
        matches += 1;
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
        if (Array.isArray(receiptComposition.match(new RegExp(strReg, "ig"))))
          matches += 1;
        return;
      }

      if (
        Array.isArray(
          receiptComposition.match(
            new RegExp(`^(.+?\\s)?${userComposition}(\\s+.+)?$`, "i")
          )
        )
      ) {
        matches += 1;
        return;
      }
    });
  }

  return matches;
};
