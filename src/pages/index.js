import React from "react";
import Layout from "@theme/Layout";
import Homepage from "@site/src/components/Homepage";

export default function Home() {
  return (
    <Layout
      title="Docs"
      description="A highly scalable, fast and secure blockchain platform for distributed apps, enterprise use cases and the new internet economy."
    >
      <Homepage />
    </Layout>
  );
}
