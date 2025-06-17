import type { NextPage } from 'next'
import Head from 'next/head'

import SettingsHeader from '@/components/settings/SettingsHeader'
import SecurityLogin from '@/components/settings/SecurityLogin'
import { BRAND_NAME } from '@/config/constants'

const SecurityPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'XDC Safe – Settings – Security & Login'}</title>
      </Head>

      <SettingsHeader />

      <main>
        <SecurityLogin />
      </main>
    </>
  )
}

export default SecurityPage
