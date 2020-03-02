#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -e

RUSTFLAGS='-C link-arg=-s' cargo build --target wasm32-unknown-unknown --release
cp target/wasm32-unknown-unknown/release/neth.wasm ./res/
#wasm-snip res/eth_bridge.wasm -o res/eth_bridge.wasm
#wasm-opt -Oz --output ./res/eth_bridge.wasm ./res/eth_bridge.wasm
#rm -rf target
