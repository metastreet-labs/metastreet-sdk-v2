/*
  MetaStreet v2 Sign Price Quote Example (standalone)

  $ mkdir sandbox; cd sandbox
  $ npm init -y
  $ npm i -D ts-node viem @metastreet/sdk-v2
  $ npx ts-node metastreet-sign-price-quote.ts

*/

import { privateKeyToAccount } from 'viem/accounts';
import { TypedDataDomain } from 'viem';

import { QuoteHelper } from '@metastreet/sdk-v2';

const TEST_SIGNER = privateKeyToAccount('0x1111111111111111111111111111111111111111111111111111111111111111');

const TEST_DOMAIN: TypedDataDomain = {
  name: 'Test',
  version: '1.1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
};

async function main() {
  const timestamp = Math.floor((new Date()).getTime() / 1000);

  console.log('Signing price quote for WPUNKS #1234 @ 40 WETH with expiry in 1800 seconds:');

  const signedQuote = await QuoteHelper.signQuote(
    TEST_SIGNER,
    TEST_DOMAIN,
    '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
    1234n,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    40n * 10n ** 18n,
    timestamp,
    1800,
  );

  const oracleContext = QuoteHelper.encodeQuotes([signedQuote]);
  console.log(`${oracleContext}`);
  console.log();

  console.log('Signing price quotes for WPUNKS#1234 @ 38 WETH, WPUNKS#2306 @ 300 WETH with expiry in 1800 seconds:');

  const signedQuote1 = await QuoteHelper.signQuote(
    TEST_SIGNER,
    TEST_DOMAIN,
    '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
    1234n,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    38n * 10n ** 18n,
    timestamp,
    1800,
  );
  const signedQuote2 = await QuoteHelper.signQuote(
    TEST_SIGNER,
    TEST_DOMAIN,
    '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
    2306n,
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    300n * 10n ** 18n,
    timestamp,
    1800,
  );

  const oracleContext2 = QuoteHelper.encodeQuotes([signedQuote1, signedQuote2]);
  console.log(`${oracleContext2}`);

  process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
