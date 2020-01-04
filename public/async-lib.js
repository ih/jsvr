// https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
