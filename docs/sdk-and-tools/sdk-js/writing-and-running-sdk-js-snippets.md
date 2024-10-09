---
id: writing-and-testing-sdk-js-interactions
title: Writing and testing interactions
---

[comment]: # (mx-exclude-file)

Generally speaking, we recommended to use [sc-meta CLI](/developers/meta/sc-meta-cli) to [generate the boilerplate code for your contract interactions](/developers/meta/sc-meta-cli/#calling-snippets).

Though, for writing contract interaction snippets in **JavaScript** or **TypeScript**, please refer to the [`sdk-js` cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook-v13). If you'd like these snippets to function as system tests of your contract, a choice would be to structure them as Mocha or Jest tests - take the `*.local.net.spec.ts` tests in [`mx-sdk-js-core`](https://github.com/multiversx/mx-sdk-js-core) as examples. For writing contract interaction snippets in **Python**, please refer to the [`sdk-py` cookbook](/sdk-and-tools/sdk-py/sdk-py-cookbook) - if desired, you can shape them as simple scripts, as Python unit tests, or as Jupyter notebooks.

You might also want to have a look over [**xSuite**](https://xsuite.dev), a toolkit to init, build, test, deploy contracts using JavaScript, made by the [Arda team](https://arda.run).
