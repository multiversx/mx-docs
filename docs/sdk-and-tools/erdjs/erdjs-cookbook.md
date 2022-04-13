---
id: erdjs-cookbook
title: erdjs-cookbook
---

## Deployments

### Load the contract bytecode from a file

```
import { Code } from "@elrondnetwork/erdjs";
import { promises } from "fs";

let buffer: Buffer = await promises.readFile(file);
let code = Code.fromBuffer(buffer);
```

### Load the contract bytecode from an URL

```
import axios, { AxiosResponse } from "axios";

let response: AxiosResponse<ArrayBuffer> = await axios.get("https://.../myContract.wasm", {
    responseType: 'arraybuffer',
    transformResponse: [],
    headers: {
        "Accept": "application/wasm"
    }
});

let buffer = Buffer.from(response.data);
let code = Code.fromBuffer(buffer);
```

## ABI

### Load the ABI from a file

```
import { AbiRegistry } from "@elrondnetwork/erdjs";
import { promises } from "fs";

let jsonContent: string = await promises.readFile("myAbi.json", { encoding: "utf8" });
let json = JSON.parse(jsonContent);
let abiRegistry = AbiRegistry.create(json);
let abi = new SmartContractAbi(abiRegistry, ["MyContract"]);
```

### Load the ABI from an URL

```
import axios, { AxiosResponse } from "axios";

let response: AxiosResponse = await axios.get("https://.../myAbi.json");
let abiRegistry = AbiRegistry.create(response.data);
let abi = new SmartContractAbi(abiRegistry, ["MyContract"]);
```
