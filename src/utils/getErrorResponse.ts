export const getReadableErrorMessage = (error: any) => {
  try {
    // Handle revert errors (most common in smart contracts)
    if (error.reason) {
      return error.reason
    }

    // Handle calls that fail with execution reverted
    if (error.message.includes('execution reverted:')) {
      return error.message.split('execution reverted:')[1].split('"')[1]
    }

    // Handle transaction failures
    if (error.data) {
      if (typeof error.data.message === 'string') {
        return error.data.message
      }
    }

    // Handle user rejected transactions
    if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
      return 'Transaction was rejected'
    }

    // Handle insufficient funds
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction'
    }

    return 'Transaction failed. Please try again.'
  } catch {
    return 'Something went wrong. Please try again.'
  }
}
