export const settings={
  contract_addr:"erd1qqqqqqqqqqqqqpgqzgl73876mr2e6vj80ctng2nxuku79pye835sydx762",
  ihm_level:2,
  version: "0.91",
  appname: "NFTNow Testnet",
  appli:"https://devnet.nftnow.af10.fr",
  network: "elrond-testnet",
  intro: "Create your NFT on the devnet network in one minute"
}


export const abi=
  {
    "buildInfo": {
      "rustc": {
        "version": "1.85.1",
        "commitHash": "4eb161250e340c8f48f66e2b929ef4a5bed7c181",
        "commitDate": "2025-03-15",
        "channel": "Stable",
        "short": "rustc 1.85.1 (4eb161250 2025-03-15)"
      },
      "contractCrate": {
        "name": "secretvault",
        "version": "0.0.1"
      },
      "framework": {
        "name": "multiversx-sc",
        "version": "0.57.0"
      }
    },
    "docs": [
      "An empty contract. To be used as a template when starting a new contract from scratch."
    ],
    "name": "SecretVault",
    "constructor": {
      "inputs": [],
      "outputs": []
    },
    "endpoints": [
      {
        "name": "fund",
        "mutability": "mutable",
        "payableInTokens": [
          "*"
        ],
        "inputs": [],
        "outputs": []
      },
      {
        "name": "upload",
        "mutability": "mutable",
        "payableInTokens": [
          "*"
        ],
        "inputs": [
          {
            "name": "amount_per_address",
            "type": "u64"
          }
        ],
        "outputs": [
          {
            "type": "u32"
          }
        ]
      },
      {
        "name": "preview",
        "mutability": "readonly",
        "inputs": [
          {
            "name": "key",
            "type": "u32"
          }
        ],
        "outputs": [
          {
            "type": "Document"
          }
        ]
      },
      {
        "name": "transfer",
        "onlyOwner": true,
        "mutability": "mutable",
        "inputs": [
          {
            "name": "key",
            "type": "u32"
          },
          {
            "name": "dest",
            "type": "Address"
          }
        ],
        "outputs": []
      }
    ],
    "esdtAttributes": [],
    "hasCallback": false,
    "types": {
      "Document": {
        "type": "struct",
        "fields": [
          {
            "name": "token_identifier",
            "type": "TokenIdentifier"
          },
          {
            "name": "nonce",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "BigUint"
          },
          {
            "name": "amount_per_address",
            "type": "BigUint"
          }
        ]
      }
    }
  }
