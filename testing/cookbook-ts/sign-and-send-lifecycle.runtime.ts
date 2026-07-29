import assert from "node:assert/strict";
import test from "node:test";

import {
  SendEgldLifecycle,
  type SendEgldState,
} from "./project/src/recipes/sign-and-send/lib/sendEgldLifecycle.ts";
import type {
  SendEgldCallbacks,
  SendEgldInput,
  SendEgldOutput,
} from "./project/src/recipes/sign-and-send/lib/transactions.ts";

const input: SendEgldInput = {
  receiver: "erd1qqqqqqqqqqqqqpgqexample",
  amountInSmallestDenomination: 1n,
};

const output: SendEgldOutput = {
  sessionId: "session-1",
  transactionHash: "hash-1",
};

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

test("moves from sent/pending to confirmed success", async () => {
  const states: SendEgldState[] = [];
  const lifecycle = new SendEgldLifecycle((state) => states.push(state));
  let callbacks: SendEgldCallbacks | undefined;

  const result = await lifecycle.send(input, async (_input, registered) => {
    callbacks = registered;
    return output;
  });

  assert.deepEqual(result, output);
  assert.deepEqual(
    states.map(({ status }) => status),
    ["signing", "tracking"],
  );
  assert.equal(lifecycle.getState().sessionId, output.sessionId);

  await callbacks?.onSuccess(output.sessionId);

  assert.equal(lifecycle.getState().status, "done");
  assert.equal(lifecycle.getState().transactionHash, output.transactionHash);
});

test("moves from sent/pending to confirmed failure", async () => {
  const states: SendEgldState[] = [];
  const lifecycle = new SendEgldLifecycle((state) => states.push(state));
  let callbacks: SendEgldCallbacks | undefined;

  await lifecycle.send(input, async (_input, registered) => {
    callbacks = registered;
    return output;
  });
  await callbacks?.onFail(output.sessionId);

  assert.deepEqual(
    states.map(({ status }) => status),
    ["signing", "tracking", "error"],
  );
  assert.equal(lifecycle.getState().sessionId, output.sessionId);
  assert.equal(lifecycle.getState().error, "Transaction failed on-chain.");
});

test("rejects a second rapid submission until the first session is terminal", async () => {
  const lifecycle = new SendEgldLifecycle(() => {});
  const sent = deferred<SendEgldOutput>();
  let callbacks: SendEgldCallbacks | undefined;
  let operationCalls = 0;

  const operation = async (
    _input: SendEgldInput,
    registered: SendEgldCallbacks,
  ): Promise<SendEgldOutput> => {
    operationCalls += 1;
    callbacks = registered;
    return sent.promise;
  };

  const first = lifecycle.send(input, operation);
  const second = await lifecycle.send(input, operation);

  assert.equal(second, null);
  assert.equal(operationCalls, 1);
  assert.equal(lifecycle.getState().status, "signing");

  sent.resolve(output);
  assert.deepEqual(await first, output);
  assert.equal(lifecycle.getState().status, "tracking");

  const stillBlocked = await lifecycle.send(input, operation);
  assert.equal(stillBlocked, null);
  assert.equal(operationCalls, 1);

  await callbacks?.onSuccess(output.sessionId);
  assert.equal(lifecycle.getState().status, "done");
});
