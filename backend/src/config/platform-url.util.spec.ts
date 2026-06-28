import { platformExternalUrl } from "./platform-url.util";

describe("platformExternalUrl", () => {
  const previous = {
    render: process.env.RENDER_EXTERNAL_URL,
    railway: process.env.RAILWAY_PUBLIC_DOMAIN,
  };

  afterEach(() => {
    if (previous.render === undefined) {
      delete process.env.RENDER_EXTERNAL_URL;
    } else {
      process.env.RENDER_EXTERNAL_URL = previous.render;
    }

    if (previous.railway === undefined) {
      delete process.env.RAILWAY_PUBLIC_DOMAIN;
    } else {
      process.env.RAILWAY_PUBLIC_DOMAIN = previous.railway;
    }
  });

  it("prefers Render URL when set", () => {
    process.env.RENDER_EXTERNAL_URL = "https://novaex.onrender.com";
    process.env.RAILWAY_PUBLIC_DOMAIN = "novaex.up.railway.app";

    expect(platformExternalUrl()).toBe("https://novaex.onrender.com");
  });

  it("builds https URL from Railway public domain", () => {
    delete process.env.RENDER_EXTERNAL_URL;
    process.env.RAILWAY_PUBLIC_DOMAIN = "novaex-production.up.railway.app";

    expect(platformExternalUrl()).toBe("https://novaex-production.up.railway.app");
  });
});
