import { Browser, Page } from "puppeteer-core";
import { scrapePost } from "./scripts/scrapeGoogle";

// Type definitions
interface EventType {
  body?: string;
  httpMethod?: string;
  path?: string;
  rawPath?: string;
  requestContext?: {
    http?: {
      method?: string;
    };
  };
}

interface ResponseData {
  [key: string]: any;
}

// Helper function to parse request body
function parseBody(body: string): any {
  if (!body || body.trim() === "") {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    console.warn("Failed to parse body as JSON:", error);
    return {};
  }
}

// Helper function to wrap Lambda response
function wrapResponse(data: ResponseData, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "3600",
    },
    body: JSON.stringify(data),
  };
}

// Helper function to safely close Puppeteer resources with timeout protection
// Prevents Lambda functions from hanging due to unclosed browser instances
async function closeResourcesWithTimeout(
  page: Page | null,
  browser: Browser | null
) {
  const CLEANUP_TIMEOUT = 5000; // 5 seconds max for cleanup

  try {
    console.log("Starting resource cleanup...");

    await Promise.race([
      (async () => {
        if (page) {
          console.log("Closing page");
          await page.close();
          console.log("Page closed");
        }
        if (browser) {
          console.log("Closing browser");
          await browser.close();
          console.log("Browser closed");
        }
      })(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Cleanup timeout")), CLEANUP_TIMEOUT)
      ),
    ]);

    console.log("Browser cleanup completed successfully");
  } catch (cleanupError) {
    console.log(
      "Cleanup timeout or error, force killing browser:",
      cleanupError
    );

    // Force kill the browser process if normal cleanup fails
    if (browser) {
      try {
        // @ts-ignore - accessing internal process
        const browserProcess = browser.process();
        if (browserProcess) {
          browserProcess.kill("SIGKILL");
          console.log("Browser process force killed");
        }
      } catch (killError) {
        console.log("Error force killing browser:", killError);
      }
    }
  }
}

export const handler = async (event: EventType) => {
  console.log(event);
  const body = parseBody(event?.body || "");
  console.log("Body > ", body);

  // Determine if this is a Function URL event or API Gateway event
  const isFunctionURL = event.requestContext?.http?.method !== undefined;

  // Extract HTTP method based on event type
  const httpMethod = isFunctionURL
    ? event.requestContext?.http?.method?.toLowerCase()
    : event?.httpMethod?.toLowerCase();

  // Extract path based on event type
  const path = isFunctionURL ? event.rawPath : event?.path;

  if (httpMethod === "options") {
    console.log("OPTIONS method. returning");
    return wrapResponse({
      message: "Options",
      status: "ok",
    });
  }

  const pathSegment = `/${path?.split("/")[1] || ""}`;

  // Initialize browser and page
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    console.log("Initializing browser...");

    // Detect if running in AWS Lambda or locally
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

    let browserConfig;
    let puppeteer;

    if (isLambda) {
      // Lambda configuration - use puppeteer-core with chromium
      console.log("Running in Lambda environment");
      // @ts-ignore
      const chromium = await import("@sparticuz/chromium");
      puppeteer = await import("puppeteer-core");

      // Optimize for Lambda environment
      // @ts-ignore
      chromium.default.setHeadlessMode = true;
      chromium.default.setGraphicsMode = false;

      browserConfig = {
        args: [
          ...chromium.default.args,
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--disable-setuid-sandbox",
          "--no-first-run",
          "--no-sandbox",
          "--no-zygote",
          "--single-process",
          "--disable-extensions",
        ],
        defaultViewport: null,
        executablePath: await chromium.default.executablePath(),
        headless: true,
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ["--disable-extensions"],
      };
    } else {
      // Local development configuration - use full puppeteer with bundled Chromium
      console.log("Running in local environment");
      // @ts-ignore
      puppeteer = await import("puppeteer");

      browserConfig = {
        headless: false,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        ignoreHTTPSErrors: true,
      };
    }

    browser = await puppeteer.default.launch(browserConfig);
    page = await browser!.newPage();

    // Set timeouts to prevent hanging
    page.setDefaultTimeout(30000); // 30 seconds
    page.setDefaultNavigationTimeout(30000);

    console.log("Browser initialized successfully");

    // Route to appropriate script function
    if (pathSegment === "/scrape_post") {
      console.log("Processing scrape_post request");
      const result = await scrapePost(page, body);
      console.log("Scrape Post completed", result);

      // Force close with timeout
      await closeResourcesWithTimeout(page, browser);

      console.log("Returning response");
      return wrapResponse({
        message: "Scrape Post completed",
        status: "ok",
        data: result,
      });
    }

    // Default response for unknown endpoints
    return wrapResponse(
      {
        status: "error",
        message: `Unknown endpoint: ${pathSegment}`,
      },
      404
    );
  } catch (e) {
    console.log("Error (Puppeteer)");
    console.log(e);
    return wrapResponse(
      {
        status: "error",
        message: e?.message || "Unknown error occurred",
        error: e,
      },
      e?.code?.startsWith("_401") ? 401 : 500
    );
  } finally {
    // Force cleanup with timeout
    await closeResourcesWithTimeout(page, browser);
  }
};
