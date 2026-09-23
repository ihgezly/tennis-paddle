import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";

import type { ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { IntlProvider } from "@/lib/providers/intl";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <IntlProvider>
      <EcommerceProvider
        enableVariants={true}
        api={{
          serverURL: appConfig.SERVER_URL,
          cartsFetchQuery: {
            depth: 2,
            populate: {
              products: {
                slug: true,
                title: true,
                image: true,
                priceInEGP: true, // ✅ كان priceInUSD
              },
              variants: {
                priceInEGP: true, // ✅ كان priceInUSD
                options: true,
              },
            },
          },
        }}
      >
        {children}
      </EcommerceProvider>
    </IntlProvider>
  );
}