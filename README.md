# MultiversX docs
# DELETE_ME
The repository contains the [documentation](https://docs.multiversx.com) for the MultiversX Network protocol.

## About

The documentation is built over a custom [docusaurus](https://docusaurus.io/) solution and relies on Markdown files.
This repository also has GitHub actions that will trigger the real-time updating of the official documentation website by merging into the `master` branch.

## How to use locally

In order to ensure that the newly added content is correctly aligned and every Markdown feature is working as intended, one can run the project on a local machine.

### Requirements:

- a `git` client installed
- `nodejs` (v16.14.2) and `npm` installed
- optional, but useful: an IDE (Visual Code for example)

### Steps:

- clone the repository
- run `npm install` (only for the first usage)
- run `npm start`
- access `http://localhost:3000` to view your local version of the docs

Live reloading is supported, so you can view the changes in real time by saving the file and going back to the browser.

## Contributions

### About

Once a proposal to update the documentation is submitted, it will be subject to an internal review process for merging into the core repository.

### Audience

Anyone can contribute to the docs. Any help is appreciated. Here are some ways in which you can contribute:

- update parts of the documentation that no longer match the actual behaviour.
- document features that aren't documented yet.
- add additional information about a component.
- fix grammar issues.
- and so on...

### Guidelines

Each documentation page should include a `Edit this page` link that will redirect the user to the corresponding GitHub edit page. 

Alternatively, contributions can be made manually by following the steps below:

- external contributions will be made to the `development` branch.
- you can contribute from GitHub directly (not recommended) or by working locally and pushing the changes (recommended).
- the documentation pages are to be found inside the `docs` directory at the corresponding category.
- please follow `docs/utils.md` for Markdown examples.

A web version of the Markdown examples is available [here](https://docs.multiversx.com/utils/).

### Opening a `pull request`

- create a new branch starting from `development`.
- push the changes to the new branch.
- open a `pull request` from your branch to `development` branch.
- wait for MultiversX members to review your pull request.

Once approved, the pull request will be merged into the `development` branch. From time to time (and depending on the emergency of the changes) we will merge the `development` branch into `master` branch.

## **Thank you!**
