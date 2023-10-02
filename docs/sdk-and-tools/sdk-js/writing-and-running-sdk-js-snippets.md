---
id: writing-and-testing-sdk-js-interactions
title: Writing and testing interactions
---

[comment]: # (mx-exclude-file)

In the past, this page was describing how to use the now-deprecated library [`sdk-js-snippets`](https://github.com/multiversx/mx-deprecated-sdk-js-snippets) to code Smart Contract interactions in JavaScript, for testing purposes.

Instead, it's now recommended to use [sc-meta CLI](/developers/meta/sc-meta-cli) to [generate the boilerplate code for your interactions](/developers/meta/sc-meta-cli/#calling-snippets).

Though, for writing contract interaction snippets in **JavaScript** or **TypeScript**, please refer to the [`sdk-js` cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook). A choice would be to structure them as Mocha or Jest tests - take the `*.local.net.spec.ts` tests in [`mx-sdk-js-core`](https://github.com/multiversx/mx-sdk-js-core) as examples. For writing contract interaction snippets in **Python**, please refer to the [`sdk-py` cookbook](/sdk-and-tools/sdk-py/sdk-py-cookbook) - you can write interaction snippets as Python unit tests, or as Jupyter notebooks.
