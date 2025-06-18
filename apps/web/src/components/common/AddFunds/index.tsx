import { Box, FormControlLabel, Grid, Paper, Switch, Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import QRCode from '@/components/common/QRCode'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setQrShortName } from '@/store/settingsSlice'
import BuyCryptoButton from '@/components/common/BuyCryptoButton'
import useChainId from '@/hooks/useChainId'

const AddFundsCTA = () => {
  const safeAddress = useSafeAddress()
  const chain = useCurrentChain()
  const currChainId = useChainId()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(selectSettings)
  const xinfinChainId = ['50', '51']
  const addressWithPrefix = xinfinChainId.includes(currChainId) ? safeAddress.replace('0x', 'xdc') : safeAddress
  const qrPrefix = settings.shortName.qr ? `${chain?.shortName}:` : ''
  const qrCode = `${qrPrefix}${addressWithPrefix}`
  return (
    <Paper data-testid="add-funds-section">
      <Grid
        container
        sx={{
          gap: 3,
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Grid item>
          <div>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'border.light',
                borderRadius: 1,
                display: 'inline-block',
              }}
            >
              <QRCode value={qrCode} size={195} />
            </Box>
          </div>

          <FormControlLabel
            control={
              <Switch checked={settings.shortName.qr} onChange={(e) => dispatch(setQrShortName(e.target.checked))} />
            }
            label={<>QR code with chain prefix</>}
          />
        </Grid>

        <Grid
          item
          container
          xs={12}
          md={6}
          sx={{
            gap: 2,
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
            }}
          >
            Add funds to get started
          </Typography>

          <Typography>
            Add funds directly from your bank account or copy your address to send tokens from a different account.
          </Typography>

          <Box
            sx={{
              bgcolor: 'background.main',
              p: 2,
              borderRadius: '6px',
              alignSelf: 'flex-start',
              fontSize: '14px',
            }}
          >
            <EthHashInfo address={safeAddress} shortAddress={false} showCopyButton hasExplorer avatarSize={24} />
          </Box>

          <Box
            sx={{
              alignSelf: 'flex-start',
            }}
          >
            <BuyCryptoButton />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default AddFundsCTA
