import { useWeb3 } from '@/hooks/wallets/web3'
import { ethers } from 'ethers'
import type { JsonFragment } from 'ethers'
import React from 'react'
import FunctionUI from './FunctionUI'

interface ContractFunctionsProps {
  abi: Array<JsonFragment>
  contractAddress: string
}

const ContractFunctions: React.FC<ContractFunctionsProps> = ({ abi, contractAddress }) => {
  const provider = useWeb3()
  const [contract, setContract] = React.useState<ethers.Contract | null>(null)
  const [loading, setLoading] = React.useState<boolean>(true)
  React.useEffect(() => {
    const setupContract = async () => {
      if (!provider || !contractAddress || !abi) return

      try {
        setLoading(true)
        const signer = await provider.getSigner()
        const newContract = new ethers.Contract(contractAddress, abi, signer)
        setContract(newContract)
      } catch (err) {
        console.error('Error creating contract: ', err)
        setContract(null)
      } finally {
        setLoading(false)
      }
    }

    setupContract()
  }, [contractAddress, abi, provider])

  if (!contract) return <p>Invalid Contract</p>

  return (
    <div>
      <h2>Functions</h2>
      {abi.map((fnItem, index) => (
        <FunctionUI key={index} fnItem={fnItem} contract={contract} />
      ))}
    </div>
  )
}

export default ContractFunctions
