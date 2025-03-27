export const settings={
  contract_addr:"erd1qqqqqqqqqqqqqpgqhzt7qvdeye0d8s2hle5tgl5crsdx0a7m835sm03u56",
  ihm_level:2,
  version: "0.91",
  appname: "NFTNow Devnet",
  appli:"https://devnet.nftnow.af10.fr",
  network: "elrond-devnet",
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
        "name": "documents",
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
        "name": "withdraw",
        "mutability": "readonly",
        "inputs": [],
        "outputs": [
          {
            "type": "variadic<u32>",
            "multi_result": true
          }
        ]
      },
      {
        "name": "upload",
        "mutability": "mutable",
        "payableInTokens": [
          "*"
        ],
        "inputs": [],
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
          }
        ]
      }
    }
  }

