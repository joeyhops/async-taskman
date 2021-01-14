export async function testPromise(): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve('Something'), 500);
  });
}

export async function testPromiseExecutes(data: string): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(data), 500);
  });
}

export async function testPromiseReject(): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(), 500);
  });
}