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
