// Example usage of the contract integration
import { useWeb3 } from '../../hooks/web3/useWeb3'

export default function ContractIntegrationExample() {
  const {
    isConnected,
    address,
    connectWallet,
    mintMedicalCertificate,
    getCertificate,
    certificateExists,
    getTotalCertificates,
    authorizeContract,
    isContractAuthorized,
    getPaymasterDeposit
  } = useWeb3()

  // Example: Mint a medical certificate
  const handleMintCertificate = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      const result = await mintMedicalCertificate({
        to: address,
        patientId: `patient-${address.slice(2, 8)}-${Date.now()}`,
        diagnosis: 'Cardiac Arrhythmia',
        accuracy: BigInt(95),
        conditions: ['arrhythmia', 'tachycardia'],
        tokenURI: 'ipfs://QmExampleCertificate/metadata.json'
      })
      
      console.log('Certificate minted:', result)
      alert(`Certificate minted successfully! Transaction: ${result}`)
    } catch (error) {
      console.error('Failed to mint certificate:', error)
      alert('Failed to mint certificate')
    }
  }

  // Example: Check if a certificate exists
  const handleCheckCertificate = async () => {
    try {
      const exists = await certificateExists(BigInt(1))
      console.log('Certificate exists:', exists)
      alert(`Certificate exists: ${exists}`)
    } catch (error) {
      console.error('Failed to check certificate:', error)
      alert('Failed to check certificate')
    }
  }

  // Example: Get total certificates
  const handleGetTotalCertificates = async () => {
    try {
      const total = await getTotalCertificates()
      console.log('Total certificates:', total.toString())
      alert(`Total certificates: ${total.toString()}`)
    } catch (error) {
      console.error('Failed to get total certificates:', error)
      alert('Failed to get total certificates')
    }
  }

  // Example: Check paymaster deposit
  const handleCheckPaymasterDeposit = async () => {
    try {
      const deposit = await getPaymasterDeposit()
      console.log('Paymaster deposit:', deposit.toString())
      alert(`Paymaster deposit: ${deposit.toString()} wei`)
    } catch (error) {
      console.error('Failed to get paymaster deposit:', error)
      alert('Failed to get paymaster deposit')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Medical Contract Integration Example</h1>
      
      {!isConnected ? (
        <button 
          onClick={connectWallet}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div>
          <p>Connected as: {address}</p>
          
          <div style={{ marginTop: '20px' }}>
            <h2>Medical Achievement NFT</h2>
            <button 
              onClick={handleMintCertificate}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Mint Certificate
            </button>
            
            <button 
              onClick={handleCheckCertificate}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Check Certificate #1
            </button>
            
            <button 
              onClick={handleGetTotalCertificates}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Get Total Certificates
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h2>Medical Paymaster</h2>
            <button 
              onClick={handleCheckPaymasterDeposit}
              style={{
                padding: '10px 20px',
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Check Paymaster Deposit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}