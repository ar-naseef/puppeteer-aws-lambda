import { Page } from "puppeteer-core";

export const scrapePost = async (page: Page, body: any) => {
  try {
    console.log("Starting scrapePost function");
    console.log("Request body:", body);

    // Example: Navigate to a URL (you can modify this based on your needs)
    const url = body?.url || "https://example.com";
    console.log(`Navigating to: ${url}`);

    await new Promise((resolve) => setTimeout(resolve, 5000));

    await page.goto(url, { waitUntil: "networkidle0" });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Example: Extract page title and other data
    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      };
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Scraped data:", pageData);

    return {
      success: true,
      data: pageData,
      message: "Post scraped successfully",
    };
  } catch (error) {
    console.error("Error in scrapePost:", error);
    throw error;
  }
};
