import React from "react";
import { useThemeConfig } from "@docusaurus/theme-common";
import FooterLinks from "@theme/Footer/Links";
import FooterLogo from "@theme/Footer/Logo";
import FooterLayout from "@theme/Footer/Layout";

function Footer() {
  const { footer } = useThemeConfig();
  if (!footer) {
    return null;
  }
  const { links, logo, style } = footer;
  return (
    <FooterLayout
      style={style}
      links={links && links.length > 0 && <FooterLinks links={links} />}
      logo={logo && <FooterLogo logo={logo} />}
      copyright={
        <a
          href="https://multiversx.com"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Made with
          <svg
            aria-hidden="true"
            focusable="false"
            className="footer-favicon"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"
            ></path>
          </svg>
          by MultiversX
        </a>
      }
    />
  );
}
export default React.memo(Footer);
