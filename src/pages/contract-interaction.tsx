import type { NextPage } from 'next'
import Head from 'next/head'
import PageHeader from '@/components/common/PageHeader'
import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Card,
  CardContent,
  Button,
  FormHelperText,
} from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import { usePendingSafe } from '@/components/new-safe/create/steps/StatusStep/usePendingSafe'
import type { ChangeEvent } from 'react'
import React, { useState } from 'react'
import useWallet from '@/hooks/wallets/useWallet'
import { InfoOutlined } from '@mui/icons-material'
import { isAddress, type JsonFragment } from 'ethers'
import ContractFunctions from '@/components/contract-interaction/ContractFunctions'

const ContractInteraction: NextPage = () => {
  const [abiString, setAbiString] = useState('')
  const [isAbiError, setIsAbiError] = useState<boolean>(false)
  const [abiErrorMessage, setAbiErrorMessage] = useState<string>('')
  const [contractAddress, setContractAddress] = useState<string>('')
  const [abiJsonData, setAbiJsonData] = useState<JsonFragment[]>([])
  const [pendingSafe] = usePendingSafe()
  const wallet = useWallet()

  if (!pendingSafe?.safeAddress) return null

  const formatToValidJson = (input: string) => {
    // Handle empty or whitespace-only input
    if (!input || !input.trim()) {
      setAbiString('') // Reset to empty string
      setAbiJsonData([]) // Reset JSON data
      throw new Error('Input cannot be empty')
    }

    try {
      let cleaned = input.trim()

      // Basic check if the input starts and ends with valid JSON characters
      if (!(cleaned.startsWith('[') && cleaned.endsWith(']'))) {
        throw new Error('Invalid JSON format: Must start and end with []')
      }

      cleaned = cleaned.replace(/'/g, '"')
      cleaned = cleaned.replace(/([{,]\s*)(\w+):/g, '$1"$2":')
      cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
      cleaned = cleaned.replace(/,,+/g, ',')

      const parsed = JSON.parse(cleaned)

      // Additional validation: check if parsed result is actually an object or array
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid JSON: Must be an array')
      }

      return {
        raw: cleaned,
        formatted: JSON.stringify(parsed, null, 2),
        parsed: parsed,
      }
    } catch (error) {
      // Rethrow with more specific error message
      throw new Error(`Invalid JSON: ${(error as Error).message}`)
    }
  }

  const handleAbiChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value

    // Handle clearing the input
    if (!value) {
      setAbiString('')
      setAbiJsonData([])
      setIsAbiError(false)
      setAbiErrorMessage('')
      return
    }

    try {
      const result = formatToValidJson(value)

      if (Array.isArray(result.parsed) !== Array.isArray(abiJsonData)) {
        throw new Error('Please enter ABI properly')
      }
      setAbiString(result.formatted)
      setAbiJsonData(result.parsed)
      setIsAbiError(false)
      setAbiErrorMessage('')
    } catch (err) {
      setIsAbiError(true)
      setAbiErrorMessage((err as Error).message || 'Invalid ABI format')
      // Update the input field with the current value
      setAbiString(value)
      setAbiJsonData([])
    }
  }

  const card = (
    <>
      <CardContent>
        <Box sx={{ mb: 1 }}>
          <Typography fontWeight="600">Smart-contract</Typography>
          {pendingSafe.safeAddress && (
            <EthHashInfo
              address={pendingSafe.safeAddress}
              hasExplorer
              showCopyButton
              showName={false}
              shortAddress={false}
              showAvatar={false}
            />
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          sx={{
            mb: 2,
            cursor: 'default',
            pointerEvents: 'none',
            '&:hover': {
              backgroundColor: 'primary.main', // Use the same color as non-hover state
            },
          }}
        >
          Balance: {wallet?.balance}
        </Button>
        <FormControl error={contractAddress.length > 0 && !isAddress(contractAddress)} fullWidth sx={{ mb: 2 }}>
          <FormLabel htmlFor="address" sx={{ color: '#fff' }}>
            Contract address:
          </FormLabel>
          <TextField
            size="small"
            autoComplete="off"
            id="address"
            placeholder="Enter contract address here…"
            defaultValue=""
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
            required
            error={contractAddress.length > 0 && !isAddress(contractAddress)}
          />
          {contractAddress.length > 0 && !isAddress(contractAddress) && (
            <FormHelperText
              sx={{
                display: 'flex',
                alignContent: 'center',
                alignItems: 'center',
                gap: '10px',
              }}
              error
            >
              <InfoOutlined />
              <div>Invalid contract address</div>
            </FormHelperText>
          )}
        </FormControl>
        <FormControl error={isAbiError} fullWidth sx={{ mb: 2 }}>
          <FormLabel htmlFor="abi" sx={{ color: '#fff' }}>
            ABI:
          </FormLabel>
          <TextField
            size="small"
            id="abi"
            autoComplete="off"
            multiline
            // placeholder="Enter ABI here…"
            placeholder={`[
   {
      "inputs": [
         {
            "internalType": "bytes32",
            "name": "role",
            "type": "bytes32"
         }
      ],
      "name": "getRoleAdmin",
      "outputs": [
         {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
         }
      ],
      "stateMutability": "view",
      "type": "function"
   }
]`}
            value={abiString}
            minRows={2}
            maxRows={4}
            variant="outlined"
            sx={{ mt: 1 }}
            onChange={(e) => handleAbiChange(e)}
            required
            error={isAbiError}
          />
          {isAbiError && (
            <FormHelperText
              sx={{
                display: 'flex',
                alignContent: 'center',
                alignItems: 'center',
                gap: '10px',
              }}
              error
            >
              <InfoOutlined />
              <div>{abiErrorMessage}</div>
            </FormHelperText>
          )}
        </FormControl>
        {abiJsonData.length > 0 && wallet && isAddress(contractAddress) && (
          <ContractFunctions abi={abiJsonData} contractAddress={contractAddress} />
        )}
      </CardContent>
    </>
  )

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 52px)', maxWidth: '100%', pb: '40px' }}
    >
      <Head>
        <title>{'Safe{Wallet} – Contract interaction'}</title>
      </Head>
      <PageHeader title="Contract interaction" noBorder />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
        }}
      >
        <Card
          sx={{
            maxWidth: '1000px',
            width: '100%',
            margin: '0 16px',
          }}
          variant="outlined"
        >
          {card}
        </Card>
      </Box>
    </Box>
  )
}

export default ContractInteraction
