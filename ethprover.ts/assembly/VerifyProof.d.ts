declare module 'VerifyProof' {
    export class VerifyProof {
        alert(message: string): void;
        log(logIndex: number, txPath: Uint8Array, log: Array<any>, parentNodes: Array<any>, header: Uint8Array, blockHash: Uint8Array): bool;
    }
}