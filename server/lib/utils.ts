export const range = (length: number) => [...Array(length).keys()];

export const series = <T>(array: T[], func: (item: T) => any) => (array || []).reduce(
  (lastPromise, item) => lastPromise.then(() => func(item)),
  Promise.resolve());

export const sleep = (ms: number) => new Promise<void>(resolve => {
  setTimeout(resolve, ms);
});
