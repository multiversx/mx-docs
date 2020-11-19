---
id: utils
title: Markdown Examples
---

## Base Syntax

Example text with nothing specific

### Bold

**bold text**

### Italic

*italicized text*

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

[title](https://www.elrond.com)

### Image

![alt text](image.jpg)

## Extended Syntax

### Table

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

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
console.log('Hello, world!');
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
The content and title *can* include markdown.
For example:
```js
console.log('Hello, world!');
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