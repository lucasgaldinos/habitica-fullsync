/**
 * A simple rate-limited queue to ensure we don't spam the Habitica API.
 * Habitica's limit is generally 30 requests per minute (1 every 2 seconds).
 * However, we will use a small delay by default, and only back off if we encounter 429s.
 */
export class ActionQueue {
    private queue: Array<() => Promise<unknown>> = [];
    private isProcessing = false;
    
    // Strict delay between requests to be safe (30 requests per minute = 1 every 2000ms)
    private defaultDelayMs = 2000;
    private backoffDelayMs = 60000; // 1 minute backoff if we hit a 429

    /**
     * Enqueues an async action.
     * @param action A function returning a Promise.
     * @returns A promise that resolves when the action completes.
     */
    enqueue<T>(action: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await action();
                    resolve(result);
                } catch (error) {
                    reject(error instanceof Error ? error : new Error(String(error)));
                    // Propagate the error up so the processor knows if it's a 429
                    throw error;
                }
            });
            void this.processQueue();
        });
    }

    /**
     * Processes the queued actions sequentially with a rate limit delay.
     */
    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const action = this.queue.shift();
            if (action) {
                let hitRateLimit = false;
                try {
                    await action();
                } catch (error: unknown) {
                    // Check if it's a rate limit error (429)
                    const isRateLimit = error instanceof Error && error.message.includes('status 429') 
                        || (typeof error === 'object' && error !== null && (error as {status?: number}).status === 429);
                    
                    if (isRateLimit) {
                        console.error('[ActionQueue] Rate limit hit (429). Backing off...');
                        hitRateLimit = true;
                    } else {
                        console.error('[ActionQueue] Action failed:', error);
                    }
                }
                
                // Wait before the next request to respect rate limits
                if (this.queue.length > 0) {
                    if (hitRateLimit) {
                        await this.delay(this.backoffDelayMs);
                    } else {
                        await this.delay(this.defaultDelayMs);
                    }
                }
            }
        }

        this.isProcessing = false;
    }

    /**
     * Helper to delay execution.
     * @param ms Milliseconds to delay.
     */
    private delay(ms: number) {
        return new Promise(resolve => window.setTimeout(resolve, ms));
    }
}
