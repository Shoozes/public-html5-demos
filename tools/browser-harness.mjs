import { launchChromium } from './browser-runtime.mjs';
import { createStaticServer } from './ragdoll-parity/static-server.mjs';

export async function openBrowserHarness(root, { browserOptions = {}, serverOptions = {} } = {}) {
  const server = createStaticServer(root, serverOptions);
  let browser;

  try {
    const address = await server.listen();
    browser = await launchChromium(browserOptions);
    return {
      address,
      browser,
      server,
      async close() {
        const results = await Promise.allSettled([browser.close(), server.close()]);
        const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
        if (errors.length) throw new AggregateError(errors, 'Browser harness cleanup failed');
      }
    };
  } catch (error) {
    await Promise.allSettled([browser?.close(), server.close()]);
    throw error;
  }
}
