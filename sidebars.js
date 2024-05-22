/**
 * Revised sidebar configuration for the MultiversX documentation,
 * designed to help new developers navigate the learning resources effectively.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'welcome/welcome-to-multiversx',
        'technology/architecture-overview',
        'technology/glossary',
        'technology/entities',
        'technology/chronology',
        'setup/installing-mxpy',
        'setup/configuring-mxpy',
        'setup/cli-overview',
        'setup/build-reference',
        'setup/configuration',
      ],
    },
    {
      type: 'category',
      label: 'Core Blockchain Concepts',
      items: [
        'blockchain-basics/secure-proof-of-stake',
        'blockchain-basics/adaptive-state-sharding',
        'smart-contracts/smart-contracts-overview',
        'smart-contracts/multiversx-smart-contracts',
        'smart-contracts/smart-contract-api-functions',
        'smart-contracts/smart-contract-annotations',
        'smart-contracts/smart-contract-modules',
        'smart-contracts/upgrading-smart-contracts',
      ],
    },
    {
      type: 'category',
      label: 'Development Tools and SDKs',
      items: [
        'development-tools/sdks-overview',
        'development-tools/python-sdk',
        'development-tools/javascript-sdk',
        'development-tools/nestjs-sdk',
        'development-tools/go-sdk',
        'development-tools/java-sdk',
        'development-tools/cplusplus-sdk',
        'development-tools/kotlin-sdk',
        'development-tools/tooling-overview',
        'development-tools/smart-contract-debugging',
        'development-tools/rust-testing-framework',
        'development-tools/memory-allocation',
        'development-tools/rust-nightly',
      ],
    },
    {
      type: 'category',
      label: 'Building Applications',
      items: [
        'building-applications/your-first-dapp',
        'building-applications/your-first-microservice',
        'building-applications/crowdfunding-p1',
        'building-applications/crowdfunding-p2',
        'building-applications/counter',
        'building-applications/staking-contract',
        'building-applications/advanced-smart-contract-features/smart-contract-payments',
        'building-applications/advanced-smart-contract-features/smart-contract-calls',
        'building-applications/advanced-smart-contract-features/storage-mappers',
        'building-applications/advanced-smart-contract-features/random-numbers',
      ],
    },
    {
      type: 'category',
      label: 'Transaction Management and Testing',
      items: [
        'transaction-management/signing-transactions',
        'transaction-management/smart-contract-call-events',
        'transaction-management/esdt-operations-events',
        'transaction-management/testing-overview',
        'transaction-management/running-scenarios',
        'transaction-management/network-and-infrastructure/localnet-setup',
        'transaction-management/network-and-infrastructure/blockchain-operations',
        'transaction-management/network-and-infrastructure/node-operation-modes',
        'transaction-management/network-and-infrastructure/managing-a-validator-node',
      ],
    },
    {
      type: 'category',
      label: 'Integration and Advanced Topics',
      items: [
        'integration/integrate-egld',
        'integration/esdt-tokens-integration-guide',
        'integration/host-multiversx-infrastructure',
        'integration/ad-astra-bridge-architecture',
        'integration/validator-and-staking-management/validators-overview',
        'integration/validator-and-staking-management/staking-v4',
        'integration/validator-and-staking-management/the-delegation-manager',
        'integration/validator-and-staking-management/node-cli',
      ],
    },
    {
      type: 'category',
      label: 'Additional Resources and Support',
      items: [
        'additional-resources/faqs',
        'additional-resources/fix-rust-installation',
        'additional-resources/multiversx-tools-on-multiple-platforms',
        'additional-resources/community-and-governance/governance-overview',
        'additional-resources/community-and-governance/economics',
        'additional-resources/community-and-governance/useful-links',
      ],
    },
  ],
};

module.exports = sidebars;
