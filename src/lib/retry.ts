// src/lib/retry.ts

/**
 * Retries a promise-based operation with exponential backoff.
 * @param operation The function that returns a promise to be retried.
 * @param maxRetries The maximum number of times to retry. Default is 3.
 * @param initialDelay The initial delay in milliseconds. Default is 1000ms.
 * @returns A promise that resolves with the result of the operation if successful.
 * @throws An error if the operation fails after all retries.
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Operation failed. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Operation failed after ${maxRetries} retries: ${lastError?.message}`);
}
