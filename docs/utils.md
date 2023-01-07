---
id: utils
title: Markdown Examples
---

## Base Syntax

Example text with nothing specific

### Bold

**bold text**

### Italic

_italicized text_

### Blockquote

> blockquote

### Ordered List

1. First item
2. Second item
3. Third item

### Unordered List

- First item
- Second item
- Third item

### Code

`code`

### Horizontal Rule

---

### Link

[absolute URL](https://www.multiversx.com)

[relative URL](/developers/esdt-tokens#token-management)

### Image

![alt text](image.jpg)

## Extended Syntax

### Table

| Syntax    | Description |
| --------- | ----------- |
| Header    | Title       |
| Paragraph | Text        |

### Fenced Code Block

```
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

### Footnote

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

### Heading ID

### My Great Heading {#custom-id}

### Definition List

term
: definition

### Strikethrough

~~The world is flat.~~

### Task List

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

### Tabs

<!--DOCUSAURUS_CODE_TABS-->

<!--First Tab-->

Example text with an emoji
🟢 Good info
🔴 Bad info

<!--Second Tab-->

```js
console.log("Hello, world!");
```

<!--Third Tab-->

```json
{
  "status": {
    "key0": 0,
    "key1": 1,
    "key2": 123,
    "key3": 1234,
    "key4": 123456
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### Info Admonitions

Available cases: caution, note, important, tip, warning

:::caution
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in turpis dignissim sapien sodales dignissim. Phasellus malesuada viverra consectetur. Aliquam et diam quis lectus luctus molestie. Pellentesque a dictum orci.
:::

:::note Custom Title
The content and title _can_ include markdown.
For example:

```js
console.log("Hello, world!");
```

:::

:::important
`example/endpoint` text about it
:::

:::tip
Lorem ipsum dolor sit amet !
:::

:::warning
Oh, no ! Lorem ipsum dolor sit amet
:::

---

### `GET` API Call

## <span class="badge badge-primary">GET</span> API Call

## <span class="badge badge-success">POST</span> API Call

:::important Custom Title
The content and title _can_ include markdown.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--First Tab-->

Path Parameters

`https://gateway.multiversx.com/transaction/*param*`

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query.                 |
| gasPrice      | <span class="text-muted">OPTIONAL</span>  | `number` | The desired Gas Price (per Gas Unit). |
| storageKey    | <span class="text-danger">REQUIRED</span> | `string` | The storage entry to fetch.           |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query.                 |

<!--Second Tab-->

```js
console.log("Hello, world!");
```

<!--Third Tab-->

🟢 200 OK

Value (hex-encoded) successfully retrieved.

```json
{
  "status": {
    "key0": 0,
    "key1": 1,
    "key2": 123,
    "key3": 1234,
    "key4": 123456
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::

# LaTeX

## LaTeX Example

### Inline

Text that contains a function $ f(a,b,c) = (a^2+b^2+c^2)^3 $ and continues after that function.

Text that contains an integral $\int_{a}^{b} x^2 \,dx$ and continues after that $\binom{n}{k}$

### Block

$$
f(a,b,c) = (a^2+b^2+c^2)^3
$$

Example text

$$
\binom{n}{k} = \frac{n!}{k!(n-k)!}
$$

$$
\relax{y} = \int_{-\infty}^\infty
    \hat\xi\,e^{2 \pi i \xi x}
    \,d\xi
$$

$$
|x| = \begin{Bmatrix} x  & {if } x \geq 0 \\ -x & {if } x < 0 \end{Bmatrix}
$$

### YouTube Embed

## First Version

[![MultiversX IDE](https://img.youtube.com/vi/bXbBfJCRVqE/maxresdefault.jpg)](http://www.youtube.com/watch?v=bXbBfJCRVqE "MultiversX IDE")

## Second version

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/bXbBfJCRVqE?playlist=bXbBfJCRVqE&loop=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
$$
