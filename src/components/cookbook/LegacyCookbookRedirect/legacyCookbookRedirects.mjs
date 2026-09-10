export const LEGACY_COOKBOOK_PATH =
  "/sdk-and-tools/sdk-js/sdk-js-cookbook";
export const COOKBOOK_PATH = "/sdk-and-tools/sdk-js/cookbook";

// Every heading ID from the former v15 monolithic cookbook is kept here so
// external bookmarks can land on the closest current recipe. Keep this grouped
// by destination: it makes deliberate many-to-one migrations easy to review.
export const legacyCookbookRedirectGroups = [
  {
    to: COOKBOOK_PATH,
    anchors: ["overview"],
  },
  {
    to: `${COOKBOOK_PATH}#start-here`,
    anchors: ["calling-the-faucet"],
  },
  {
    to: `${COOKBOOK_PATH}#accounts`,
    anchors: [
      "creating-accounts",
      "saving-the-account-to-a-file",
      "compatibility-with-iaccount-interface",
      "account-management",
    ],
  },
  {
    to: `${COOKBOOK_PATH}/accounts/save-key-value`,
    anchors: [
      "saving-a-key-value-pair-to-an-account-using-the-controller",
      "saving-a-key-value-pair-to-an-account-using-the-factory",
    ],
  },
  {
    to: `${COOKBOOK_PATH}#network-providers`,
    anchors: ["interacting-with-the-network"],
  },
  {
    to: `${COOKBOOK_PATH}/fetching-data-from-network/reference`,
    anchors: ["fetching-data-from-the-network"],
  },
  {
    to: `${COOKBOOK_PATH}#transactions`,
    anchors: [
      "creating-transactions",
      "instantiating-controllers-and-factories",
      "token-transfers",
    ],
  },
  {
    to: `${COOKBOOK_PATH}#tokens`,
    anchors: ["token-management"],
  },
  {
    to: `${COOKBOOK_PATH}#smart-contracts-call`,
    anchors: ["smart-contracts", "smart-contract-calls"],
  },
  {
    to: `${COOKBOOK_PATH}#smart-contracts-deploy`,
    anchors: ["smart-contract-deployments"],
  },
  {
    to: `${COOKBOOK_PATH}#delegation`,
    anchors: ["delegation-management"],
  },
  {
    to: `${COOKBOOK_PATH}#multisig`,
    anchors: ["multisig"],
  },
  {
    to: `${COOKBOOK_PATH}/multisig/deploy-multisig-contract`,
    anchors: [
      "deploying-a-multisig-smart-contract-using-the-controller",
      "deploying-a-multisig-smart-contract-using-the-factory",
    ],
  },
  {
    to: `${COOKBOOK_PATH}#governance`,
    anchors: ["governance", "querying-the-governance-contract"],
  },
  {
    to: `${COOKBOOK_PATH}#wallets`,
    anchors: ["wallets"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/configure-network-provider",
    anchors: [
      "creating-an-entrypoint",
      "using-a-proxy",
      "creating-a-network-provider",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/custom-api-request",
    anchors: ["using-a-custom-api", "custom-apiproxy-calls"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/account-from-keys",
    anchors: [
      "other-ways-to-instantiate-an-account",
      "from-a-secret-key",
      "from-a-mnemonic",
      "from-a-keypair",
      "generating-a-keypair",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/pem-save-load",
    anchors: [
      "from-a-pem-file",
      "saving-the-account-to-a-pem-file",
      "saving-a-secret-key-to-a-pem-file",
      "loading-a-wallet-from-a-pem-file",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/keystore-save-load",
    anchors: [
      "from-a-keystore-file",
      "saving-the-account-to-a-keystore-file",
      "saving-the-mnemonic-to-a-keystore-file",
      "saving-a-secret-key-to-a-keystore-file",
      "loading-a-wallet-from-keystore-mnemonic-file",
      "loading-a-wallet-from-a-keystore-secret-key-file",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/manage-nonces",
    anchors: ["managing-the-account-nonce", "sending-multiple-transactions"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/wallets/ledger-login",
    anchors: ["using-a-ledger-device", "creating-a-ledger-account"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/fetch-network-config-status",
    anchors: ["fetching-the-network-config", "fetching-the-network-status"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/fetch-a-block",
    anchors: [
      "fetching-a-block-from-the-network",
      "fetching-a-block-using-the-api",
      "fetching-a-block-using-the-proxy",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/fetch-account-state",
    anchors: ["fetching-an-account", "fetching-an-accounts-storage"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/await-account-on-condition",
    anchors: ["waiting-for-an-account-to-meet-a-condition"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/simulate-estimate-transaction",
    anchors: [
      "sending-and-simulating-transactions",
      "simulating-transactions",
      "estimating-the-gas-cost-of-a-transaction",
      "estimating-the-gas-limit-for-transactions",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/transactions/send-egld",
    anchors: [
      "sending-a-transaction",
      "native-token-transfers-using-the-controller",
      "native-token-transfers-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/network-providers/await-transaction-on-condition",
    anchors: [
      "waiting-for-transaction-completion",
      "waiting-for-a-transaction-to-satisfy-a-condition",
      "waiting-for-transaction-completion-1",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/transactions/track-transaction-status",
    anchors: ["fetching-transactions-from-the-network"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/fetch-account-token-balances",
    anchors: [
      "fetching-a-token-from-an-account",
      "fetching-all-fungible-tokens-of-an-account",
      "fetching-all-non-fungible-tokens-of-an-account",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/fetch-token-metadata",
    anchors: ["fetching-token-metadata"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/query-contract-view",
    anchors: ["querying-smart-contracts", "smart-contract-queries"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/transactions/send-esdt",
    anchors: [
      "custom-token-transfers-using-the-controller",
      "custom-token-transfers-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/transactions/multi-token-transfer",
    anchors: ["sending-native-and-custom-tokens"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/load-abi",
    anchors: [
      "contract-abis",
      "loading-the-abi-from-a-file",
      "loading-the-abi-from-an-url",
      "manually-construct-the-abi",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-deploy/deploy-contract",
    anchors: [
      "deploying-a-smart-contract-using-the-controller",
      "parsing-contract-deployment-transactions",
      "deploying-a-smart-contract-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-deploy/compute-contract-address",
    anchors: ["computing-the-contract-address"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/call-contract-endpoint",
    anchors: [
      "calling-a-smart-contract-using-the-controller",
      "parsing-smart-contract-call-transactions",
      "calling-a-smart-contract-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/call-payable-endpoint",
    anchors: ["calling-a-smart-contract-and-sending-tokens-transfer--execute"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/decode-return-data",
    anchors: [
      "parsing-transaction-outcome",
      "encoding--decoding-custom-types",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-call/decode-contract-events",
    anchors: ["decoding-transaction-events"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/smart-contracts-deploy/upgrade-contract",
    anchors: [
      "upgrading-a-smart-contract",
      "uprgrading-a-smart-contract-using-the-controller",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/issue-fungible-token",
    anchors: [
      "issuing-fungible-tokens-using-the-controller",
      "issuing-fungible-tokens-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/set-special-roles",
    anchors: [
      "setting-special-roles-for-fungible-tokens-using-the-controller",
      "setting-special-roles-for-fungible-tokens-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/issue-sft-collection",
    anchors: [
      "issuing-semi-fungible-tokens-using-the-controller",
      "issuing-semi-fungible-tokens-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/tokens/issue-nft-collection",
    anchors: [
      "issuing-nft-collection--creating-nfts-using-the-controller",
      "issuing-nft-collection--creating-nfts-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/set-guardian",
    anchors: [
      "guarding-an-account-using-the-controller",
      "guarding-an-account-using-the-factory",
      "activating-the-guardian-using-the-controller",
      "activating-the-guardian-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/guard-unguard-account",
    anchors: [
      "unguarding-the-account-using-the-controller",
      "unguarding-the-guardian-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/delegation/create-delegation-contract",
    anchors: [
      "creating-a-new-delegation-contract-using-the-controller",
      "creating-a-new-delegation-contract-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/delegation/delegate-stake",
    anchors: [
      "delegating-funds-to-the-contract-using-the-controller",
      "delegating-funds-to-the-contract-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/delegation/claim-and-redelegate-rewards",
    anchors: [
      "redelegating-rewards-using-the-controller",
      "redelegating-rewards-using-the-factory",
      "claiming-rewards-using-the-controller",
      "claiming-rewards-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/delegation/undelegate-and-withdraw",
    anchors: [
      "undelegating-funds-using-the-controller",
      "undelegating-funds-using-the-factory",
      "withdrawing-funds-using-the-controller",
      "withdrawing-funds-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/relayed-v3-transaction",
    anchors: [
      "relayed-transactions",
      "creating-relayed-transactions-using-controllers",
      "creating-relayed-transactions-using-factories",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/apply-guardian-to-transaction",
    anchors: [
      "guarded-transactions",
      "creating-guarded-transactions-using-controllers",
      "creating-guarded-transactions-using-factories",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/multisig/propose-action",
    anchors: [
      "propose-an-action-using-the-controller",
      "propose-an-action-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/multisig/read-multisig-state",
    anchors: ["querying-the-multisig-smart-contract"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/governance/create-proposal",
    anchors: [
      "creating-a-new-proposal-using-the-controller",
      "creating-a-new-proposal-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/governance/vote-close-proposal",
    anchors: [
      "vote-for-a-proposal-using-the-controller",
      "vote-for-a-proposal-using-the-factory",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/address-utilities",
    anchors: [
      "addresses",
      "create-an-address-from-a-raw-public-key",
      "getting-the-shard-of-an-address",
      "changing-the-default-hrp",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/generate-mnemonic-derive-keys",
    anchors: ["generating-a-mnemonic", "deriving-secret-keys-from-a-mnemonic"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/sign-verify-transaction",
    anchors: [
      "signing-objects",
      "signing-a-transaction-using-an-account",
      "signing-a-transaction-using-a-secretkey",
      "verifying-transaction-signature-using-a-userverifier",
    ],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/hash-signing-transaction",
    anchors: ["signing-a-transaction-by-hash"],
  },
  {
    to: "/sdk-and-tools/sdk-js/cookbook/accounts/sign-verify-message",
    anchors: [
      "signing-a-message-using-an-account",
      "signing-a-message-using-an-secretkey",
      "verifying-signatures",
      "verifying-message-signature-using-a-userverifier",
      "verifying-a-signature-using-a-public-key",
      "sending-messages-over-boundaries",
    ],
  },
];

export const legacyCookbookRedirects = Object.freeze(
  Object.fromEntries(
    legacyCookbookRedirectGroups.flatMap(({ to, anchors }) =>
      anchors.map((anchor) => [anchor, to]),
    ),
  ),
);

export function getLegacyCookbookTarget(hash = "") {
  let anchor = hash.startsWith("#") ? hash.slice(1) : hash;

  try {
    anchor = decodeURIComponent(anchor);
  } catch {
    return COOKBOOK_PATH;
  }

  return legacyCookbookRedirects[anchor.toLowerCase()] ?? COOKBOOK_PATH;
}
