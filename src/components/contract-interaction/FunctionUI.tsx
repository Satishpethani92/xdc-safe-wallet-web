import { getReadableErrorMessage } from '@/utils/getErrorResponse'
import { Box, Button, FormControl, FormLabel, TextField } from '@mui/material'
import type { ethers } from 'ethers'
import { isAddress } from 'ethers'
import type { ChangeEvent } from 'react'
import React, { useState } from 'react'

interface FunctionUIProps {
  fnItem: ethers.JsonFragment
  contract: ethers.Contract
}

const FunctionUI: React.FC<FunctionUIProps> = ({ fnItem, contract }) => {
  const [inputs, setInputs] = useState(() =>
    fnItem.inputs?.reduce<Record<string, string>>((acc, input) => {
      if (input.name) {
        acc[input.name] = ''
      }
      return acc
    }, {}),
  )
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Validate input
  const validateInput = (name: string, value: string, type: string) => {
    let error = ''

    // Basic validation based on Solidity types
    if (type === 'address' && !isAddress(value)) {
      error = 'Invalid address'
    } else if (type.startsWith('uint') && (!/^\d+$/.test(value) || BigInt(value) < 0)) {
      error = 'Must be a positive integer'
    } else if (type.startsWith('int') && isNaN(Number(value))) {
      error = 'Must be a valid integer'
    } else if (type === 'bool' && value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
      error = 'Must be a boolean value'
    }

    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }))

    return error === ''
  }

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    input: ethers.JsonFragmentType,
  ) => {
    const { name, type } = input
    const value = e.target.value

    setInputs((prev) => ({
      ...prev,
      [name!]: value,
    }))

    validateInput(name!, value, type!)
  }

  // Check if all inputs are valid
  const areInputsValid = () => {
    return fnItem.inputs?.every((input) => {
      const name = input.name!
      const value = inputs![name]
      return value && validateInput(name, value, input.type!)
    })
  }

  // Determine if the button should be disabled
  const isButtonDisabled = React.useMemo(() => {
    if (fnItem.stateMutability === 'view' || fnItem.stateMutability === 'pure') {
      return false // Always enabled for read functions
    }
    return !areInputsValid() // Enabled only if inputs are valid
  }, [fnItem.stateMutability, inputs])

  // Call or send transaction
  const callFunction = async () => {
    setLoading(true)
    setResult('')

    try {
      const params = fnItem.inputs?.map((input) => inputs![input.name!])

      // Determine whether it's a view/pure (call) or nonpayable/payable (send)
      if (fnItem.stateMutability === 'view' || fnItem.stateMutability === 'pure') {
        // READ function
        const response = await contract[fnItem.name!](...(params as ethers.JsonFragmentType[]))
        setResult(response?.toString())
      } else {
        // WRITE function
        const tx = await contract[fnItem.name!](...(params as ethers.JsonFragmentType[]))
        const receipt = await tx.wait()
        setResult(`Transaction successful! Hash: ${receipt.hash}`)
      }
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        const readableError = getReadableErrorMessage(error)
        setResult(`Error: ${readableError}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        border: '1px solid #636669',
        padding: '8.5px 14px',
        borderRadius: '6px',
        marginBottom: '15px',
        wordWrap: 'break-word',
      }}
    >
      {fnItem.name && <h4 style={{ margin: 0, marginBottom: '5px' }}>{fnItem.name}</h4>}
      {fnItem.stateMutability && (
        <p style={{ margin: 0, marginBottom: '5px', fontStyle: 'italic' }}>{fnItem.stateMutability}</p>
      )}

      {fnItem.inputs?.map((input, idx) => (
        <FormControl
          key={idx}
          fullWidth
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', mb: '15px' }}
        >
          <FormLabel htmlFor={`${input.name} ${fnItem.name}`} sx={{ color: '#fff', width: '40%' }}>
            {input.name && input.name} ({input.type}):{' '}
          </FormLabel>
          {input.name && (
            <TextField
              size="small"
              id={`${input.name} ${fnItem.name}`}
              autoComplete="off"
              placeholder={`Enter ${input.name} here…`}
              value={inputs![input.name]}
              onChange={(e) => handleInputChange(e, input)}
              variant="outlined"
              error={!!validationErrors[input.name]}
              helperText={validationErrors[input.name]}
              sx={{ width: '60%' }}
              required
            />
          )}
        </FormControl>
      ))}

      <Button variant="contained" size="small" onClick={callFunction} disabled={loading || isButtonDisabled}>
        {loading ? 'Processing...' : 'Execute'}
      </Button>

      {result && (
        <div style={{ marginTop: '10px' }}>
          <strong>Result:</strong> {result}
        </div>
      )}
    </Box>
  )
}

export default FunctionUI
