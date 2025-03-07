const Web3 = require('web3');
const BN = require('bn.js');
const {BorshContract, hexToBuffer, readerToHex} = require('../borsh');
const roots = require('./dag_merkle_roots.json');

const borshSchema = {
    'bool': {
        kind: 'function',
        ser: (b) => Buffer.from(Web3.utils.hexToBytes(b ? '0x01' : '0x00')),
        deser: (z) => readerToHex(1)(z) === '0x01'
    },
    'initInput': {kind: 'struct', fields: [
            ['validate_ethash', 'bool'],
            ['dags_start_epoch', 'u64'],
            ['dags_merkle_roots', ['H128']]
        ]},
    'dagMerkleRootInput': { kind: 'struct', fields: [
            ['epoch', 'u64'],
        ]},
    'addBlockHeaderInput': { kind: 'struct', fields: [
            ['block_header', ['u8']],
            ['dag_nodes', ['DoubleNodeWithMerkleProof']],
        ]},
    'DoubleNodeWithMerkleProof': { kind: 'struct', fields: [
            ['dag_nodes', ['H512']],
            ['proof', ['H128']],
        ]},
    'H128': {kind: 'function', ser: hexToBuffer, deser: readerToHex(16) },
    'H256': {kind: 'function', ser: hexToBuffer, deser: readerToHex(32) },
    'H512': {kind: 'function', ser: hexToBuffer, deser: readerToHex(64) },
    '?H256': {kind: 'option', type: 'H256'}
};

class EthClientContract extends BorshContract {
    constructor(account) {
        super(borshSchema, account, {
            viewMethods: [{
                methodName: "initialized",
                inputFieldType: null,
                outputFieldType: 'bool',
            }, {
                methodName: "dag_merkle_root",
                inputFieldType: "dagMerkleRootInput",
                outputFieldType: 'H128',
            }, {
                methodName: "last_block_number",
                inputFieldType: null,
                outputFieldType: 'u64',
            }, {
                methodName: "block_hash",
                inputFieldType: "u64",
                outputFieldType: '?H256',
            }, {
                methodName: "block_hash_safe",
                inputFieldType: "u64",
                outputFieldType: '?H256',
            }],

            changeMethods: [{
                methodName: "init",
                inputFieldType: "initInput",
                outputFieldType: null,
            }, {
                methodName: "add_block_header",
                inputFieldType: "addBlockHeaderInput",
                outputFieldType: null,
            }],
        })
    }

    // Call initialization methods on the contract.
    // If validate_ethash is true will do ethash validation otherwise it won't.
    async maybeInitialize(validate_ethash) {
        await this.accessKeyInit();
        let initialized = false;
        try {
            initialized = await this.initialized();
        } catch (e) {
            // I guess not
        }
        if (!initialized) {
            console.log('EthClient is not initialized, initializing...');
            await this.init({
                validate_ethash: validate_ethash,
                dags_start_epoch: 0,
                dags_merkle_roots: roots.dag_merkle_roots
            }, new BN('1000000000000000'));
            console.log('EthClient initialized');
        }

        console.log('Checking EthClient initialization.');
        const first_root = await this.dag_merkle_root({ epoch: 0 });
        const last_root = await this.dag_merkle_root({ epoch: 511 });
        if (!(first_root === '0x55b891e842e58f58956a847cbbf67821' &&
            last_root === '0x4aa6ca6ebef942d8766065b2e590fd32')) {
            console.log(`EthClient initialization error! The first and last roots are ${first_root} and ${last_root}`);
            process.exit(1);
        }
    }
}

exports.EthClientContract = EthClientContract;
