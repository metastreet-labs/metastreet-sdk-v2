import { privateKeyToAccount } from 'viem/accounts';
import { TypedDataDomain, parseAbiParameters, decodeAbiParameters } from 'viem';

import { QuoteHelper } from '../src';

describe('QuoteHelper', function () {
  const TEST_DOMAIN: TypedDataDomain = {
    name: 'Test',
    version: '1.0',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  };

  const signer = privateKeyToAccount('0x1111111111111111111111111111111111111111111111111111111111111111');

  it('#signQuote', async function () {
    const signedQuote = await QuoteHelper.signQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      1234n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      40n * 10n ** 18n,
      1712301236,
      1800,
    );

    expect(signedQuote.quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuote.quote.tokenId).toEqual(1234n);
    expect(signedQuote.quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuote.quote.price).toEqual(40n * 10n ** 18n);
    expect(signedQuote.quote.timestamp).toEqual(1712301236n);
    expect(signedQuote.quote.duration).toEqual(1800n);
    expect(signedQuote.signature).toEqual(
      '0xe248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c',
    );
  });

  it('#encodeQuotes', async function () {
    const signedQuote1 = await QuoteHelper.signQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      1234n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      40n * 10n ** 18n,
      1712301236,
      1800,
    );

    const signedQuote2 = await QuoteHelper.signQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      2306n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      300n * 10n ** 18n,
      1712301236,
      1800,
    );

    const oracleContext1 = QuoteHelper.encodeQuotes([signedQuote1]);
    const decodedOracleContext1 = decodeAbiParameters(
      parseAbiParameters('((address,uint256,address,uint256,uint64,uint64),bytes)[]'),
      oracleContext1,
    )[0];
    expect(decodedOracleContext1.length).toEqual(1);
    expect(decodedOracleContext1[0][0][0]).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(decodedOracleContext1[0][0][1]).toEqual(1234n);
    expect(decodedOracleContext1[0][0][2]).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(decodedOracleContext1[0][0][3]).toEqual(40n * 10n ** 18n);
    expect(decodedOracleContext1[0][0][4]).toEqual(1712301236n);
    expect(decodedOracleContext1[0][0][5]).toEqual(1800n);
    expect(decodedOracleContext1[0][1]).toEqual(
      '0xe248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c',
    );

    const oracleContext2 = QuoteHelper.encodeQuotes([signedQuote1, signedQuote2]);
    const decodedOracleContext2 = decodeAbiParameters(
      parseAbiParameters('((address,uint256,address,uint256,uint64,uint64),bytes)[]'),
      oracleContext2,
    )[0];
    expect(decodedOracleContext2.length).toEqual(2);
    expect(decodedOracleContext2[0][0][0]).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(decodedOracleContext2[0][0][1]).toEqual(1234n);
    expect(decodedOracleContext2[0][0][2]).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(decodedOracleContext2[0][0][3]).toEqual(40n * 10n ** 18n);
    expect(decodedOracleContext2[0][0][4]).toEqual(1712301236n);
    expect(decodedOracleContext2[0][0][5]).toEqual(1800n);
    expect(decodedOracleContext2[0][1]).toEqual(
      '0xe248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c',
    );
    expect(decodedOracleContext2[1][0][0]).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(decodedOracleContext2[1][0][1]).toEqual(2306n);
    expect(decodedOracleContext2[1][0][2]).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(decodedOracleContext2[1][0][3]).toEqual(300n * 10n ** 18n);
    expect(decodedOracleContext2[1][0][4]).toEqual(1712301236n);
    expect(decodedOracleContext2[1][0][5]).toEqual(1800n);
    expect(decodedOracleContext2[1][1]).toEqual(
      '0x223160afdd961dd0e8d8e18341299323424442a6627e00a0529c1654a4f5582118e8537f397e85581c6f137cdb70ed97f2bf975fdb210d6d20e55c764016c2ba1b',
    );
  });
});
