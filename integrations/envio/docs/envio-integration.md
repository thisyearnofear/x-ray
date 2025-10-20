# Envio Integration Documentation

This document explains how Envio is integrated into the X-RAI Medical Diagnostic platform for the MetaMask Smart Accounts Hackathon.

## Overview

Envio is integrated as a high-performance blockchain indexer that tracks events and state changes from our deployed smart contracts on Monad testnet:

1. **MedicalAchievementNFT** (`0xA960B1692aa11a10Ff1c1595300301DfF1CDAcB4`)
2. **MedicalPaymaster** (`0x2Aa0f72AEc34Ea007aeeD1c998f28278A1501423`)

## Indexed Events

### MedicalAchievementNFT
- `CertificateMinted` - Tracks when medical certificates are minted
- `Transfer` - Tracks certificate ownership changes

### MedicalPaymaster
- `ContractAuthorized` - Tracks authorized medical contracts
- `ContractRevoked` - Tracks revoked authorizations
- `GasSponsored` - Tracks gas sponsorship events

## Data Schema

The indexed data is structured according to the GraphQL schema in `envio/schema.graphql`:

- `MedicalCertificate` - Individual medical certificates
- `GasSponsorship` - Gas sponsorship records
- `AuthorizedContract` - Contract authorization status
- `AggregatedData` - Summary statistics

## GraphQL API

Once deployed, the Envio indexer will provide a GraphQL API endpoint for querying indexed data:

```graphql
# Example queries
query GetMedicalCertificates($recipient: Bytes!) {
  medicalCertificates(where: {recipient: $recipient}) {
    id
    tokenId
    diagnosis
    accuracy
    timestamp
  }
}

query GetGasSponsorships($user: Bytes!) {
  gasSponsorships(where: {user: $user}) {
    amount
    reason
    timestamp: blockNumber
  }
}

query GetAggregatedData {
  aggregatedData(id: "latest") {
    totalCertificates
    totalGasSponsored
    totalAuthorizedContracts
  }
}
```

## Integration Benefits

1. **Real-time Analytics** - Track medical achievement metrics in real-time
2. **Performance Monitoring** - Monitor gas sponsorship usage and costs
3. **User Portfolio** - Enable users to view their medical certificate portfolio
4. **Dashboard Integration** - Power analytics dashboards with indexed data

## Deployment

To deploy the Envio indexer:

1. Install Envio CLI: `npm install -g envio`
2. Navigate to project root
3. Run: `envio deploy`

The indexer will automatically sync with Monad testnet and begin indexing events from the deployed contracts.

## Future Enhancements

1. **Notification System** - Send notifications when new certificates are minted
2. **Leaderboards** - Create medical achievement leaderboards
3. **Analytics Dashboard** - Visualize medical diagnostic trends
4. **Cross-chain Sync** - Extend indexing to other networks