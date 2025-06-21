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

    if (!QuoteHelper.isQuoteV1(signedQuote.quote)) throw new Error('Invalid quote type');

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

  it('#signRangedQuote', async function () {
    const signedQuote = await QuoteHelper.signRangedQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      1000n,
      2000n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      40n * 10n ** 18n,
      1712301236,
      1800,
    );

    if (!QuoteHelper.isQuoteV2(signedQuote.quote)) throw new Error('Invalid quote type');

    expect(signedQuote.quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuote.quote.startTokenId).toEqual(1000n);
    expect(signedQuote.quote.endTokenId).toEqual(2000n);
    expect(signedQuote.quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuote.quote.price).toEqual(40n * 10n ** 18n);
    expect(signedQuote.quote.timestamp).toEqual(1712301236n);
    expect(signedQuote.quote.duration).toEqual(1800n);
    expect(signedQuote.signature).toEqual(
      '0xdf2b1acba46514c350079852a06b7ff9b163e802784fda7b28b4b9505321ba623f4fc3542cf2a744018d0cdbf13797a70222e7284e45645967de3700e1f432351b',
    );
  });

  it('#encodeQuotes (v1)', async function () {
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

  it.only('#encodeQuotes (v2)', async function () {
    const signedQuote1 = await QuoteHelper.signRangedQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      1000n,
      2000n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      40n * 10n ** 18n,
      1712301236,
      1800,
    );

    const signedQuote2 = await QuoteHelper.signRangedQuote(
      signer,
      TEST_DOMAIN,
      '0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6',
      5000n,
      5010n,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      300n * 10n ** 18n,
      1712301236,
      1800,
    );

    const oracleContext2 = QuoteHelper.encodeQuotes([signedQuote1, signedQuote2]);
    const decodedOracleContext2 = decodeAbiParameters(
      parseAbiParameters('((address,uint256,uint256,address,uint256,uint64,uint64),bytes)[]'),
      oracleContext2,
    )[0];
    expect(decodedOracleContext2.length).toEqual(2);
    expect(decodedOracleContext2[0][0][0]).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(decodedOracleContext2[0][0][1]).toEqual(1000n);
    expect(decodedOracleContext2[0][0][2]).toEqual(2000n);
    expect(decodedOracleContext2[0][0][3]).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(decodedOracleContext2[0][0][4]).toEqual(40n * 10n ** 18n);
    expect(decodedOracleContext2[0][0][5]).toEqual(1712301236n);
    expect(decodedOracleContext2[0][0][6]).toEqual(1800n);
    expect(decodedOracleContext2[0][1]).toEqual(
      '0xdf2b1acba46514c350079852a06b7ff9b163e802784fda7b28b4b9505321ba623f4fc3542cf2a744018d0cdbf13797a70222e7284e45645967de3700e1f432351b',
    );
    expect(decodedOracleContext2[1][0][0]).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(decodedOracleContext2[1][0][1]).toEqual(5000n);
    expect(decodedOracleContext2[1][0][2]).toEqual(5010n);
    expect(decodedOracleContext2[1][0][3]).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(decodedOracleContext2[1][0][4]).toEqual(300n * 10n ** 18n);
    expect(decodedOracleContext2[1][0][5]).toEqual(1712301236n);
    expect(decodedOracleContext2[1][0][6]).toEqual(1800n);
    expect(decodedOracleContext2[1][1]).toEqual(
      '0xc8a8888be93f36afdfffee6afc5213fd8c3118c80faba331fc68c29a552b38d933c0e0ff847d51c043cb4468b744a7d2612869ef2309b5bb8abaf827285515eb1c',
    );
  });

  it('#decodeQuotes (v1)', async function () {
    const signedQuotes1 = QuoteHelper.decodeQuotes(
      '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000b7f7f6c52f2e2fdb1963eab30438024864c313f600000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000022b1c8c1227a0000000000000000000000000000000000000000000000000000000000000660fa4b4000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041e248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c00000000000000000000000000000000000000000000000000000000000000',
    );
    expect(signedQuotes1.length).toEqual(1);
    if (!QuoteHelper.isQuoteV1(signedQuotes1[0].quote)) throw new Error('Invalid quote type');
    expect(signedQuotes1[0].quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuotes1[0].quote.tokenId).toEqual(1234n);
    expect(signedQuotes1[0].quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuotes1[0].quote.price).toEqual(40n * 10n ** 18n);
    expect(signedQuotes1[0].quote.timestamp).toEqual(1712301236n);
    expect(signedQuotes1[0].quote.duration).toEqual(1800n);
    expect(signedQuotes1[0].signature).toEqual(
      '0xe248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c',
    );

    const signedQuotes2 = QuoteHelper.decodeQuotes(
      '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000b7f7f6c52f2e2fdb1963eab30438024864c313f600000000000000000000000000000000000000000000000000000000000004d2000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000022b1c8c1227a0000000000000000000000000000000000000000000000000000000000000660fa4b4000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041e248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000b7f7f6c52f2e2fdb1963eab30438024864c313f60000000000000000000000000000000000000000000000000000000000000902000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000001043561a882930000000000000000000000000000000000000000000000000000000000000660fa4b4000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000041223160afdd961dd0e8d8e18341299323424442a6627e00a0529c1654a4f5582118e8537f397e85581c6f137cdb70ed97f2bf975fdb210d6d20e55c764016c2ba1b00000000000000000000000000000000000000000000000000000000000000',
    );
    expect(signedQuotes2.length).toEqual(2);
    if (!QuoteHelper.isQuoteV1(signedQuotes2[0].quote)) throw new Error('Invalid quote type');
    expect(signedQuotes2[0].quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuotes2[0].quote.tokenId).toEqual(1234n);
    expect(signedQuotes2[0].quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuotes2[0].quote.price).toEqual(40n * 10n ** 18n);
    expect(signedQuotes2[0].quote.timestamp).toEqual(1712301236n);
    expect(signedQuotes2[0].quote.duration).toEqual(1800n);
    expect(signedQuotes2[0].signature).toEqual(
      '0xe248cffd37766c67f93b96cd6ec4df4c3faab78e15057f32585173805606d3822304218b29949e276b13d871bf67bce8d029004308968f9162e341dc475da5ac1c',
    );
    if (!QuoteHelper.isQuoteV1(signedQuotes2[1].quote)) throw new Error('Invalid quote type');
    expect(signedQuotes2[1].quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuotes2[1].quote.tokenId).toEqual(2306n);
    expect(signedQuotes2[1].quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuotes2[1].quote.price).toEqual(300n * 10n ** 18n);
    expect(signedQuotes2[1].quote.timestamp).toEqual(1712301236n);
    expect(signedQuotes2[1].quote.duration).toEqual(1800n);
    expect(signedQuotes2[1].signature).toEqual(
      '0x223160afdd961dd0e8d8e18341299323424442a6627e00a0529c1654a4f5582118e8537f397e85581c6f137cdb70ed97f2bf975fdb210d6d20e55c764016c2ba1b',
    );
  });

  it('#decodeQuotes (v2)', async function () {
    const signedQuotes2 = QuoteHelper.decodeQuotes(
      '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000b7f7f6c52f2e2fdb1963eab30438024864c313f600000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000007d0000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000022b1c8c1227a0000000000000000000000000000000000000000000000000000000000000660fa4b4000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000041df2b1acba46514c350079852a06b7ff9b163e802784fda7b28b4b9505321ba623f4fc3542cf2a744018d0cdbf13797a70222e7284e45645967de3700e1f432351b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000b7f7f6c52f2e2fdb1963eab30438024864c313f600000000000000000000000000000000000000000000000000000000000013880000000000000000000000000000000000000000000000000000000000001392000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000001043561a882930000000000000000000000000000000000000000000000000000000000000660fa4b4000000000000000000000000000000000000000000000000000000000000070800000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000041c8a8888be93f36afdfffee6afc5213fd8c3118c80faba331fc68c29a552b38d933c0e0ff847d51c043cb4468b744a7d2612869ef2309b5bb8abaf827285515eb1c00000000000000000000000000000000000000000000000000000000000000',
      2
    );
    expect(signedQuotes2.length).toEqual(2);
    if (!QuoteHelper.isQuoteV2(signedQuotes2[0].quote)) throw new Error('Invalid quote type');
    expect(signedQuotes2[0].quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuotes2[0].quote.startTokenId).toEqual(1000n);
    expect(signedQuotes2[0].quote.endTokenId).toEqual(2000n);
    expect(signedQuotes2[0].quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuotes2[0].quote.price).toEqual(40n * 10n ** 18n);
    expect(signedQuotes2[0].quote.timestamp).toEqual(1712301236n);
    expect(signedQuotes2[0].quote.duration).toEqual(1800n);
    expect(signedQuotes2[0].signature).toEqual(
      '0xdf2b1acba46514c350079852a06b7ff9b163e802784fda7b28b4b9505321ba623f4fc3542cf2a744018d0cdbf13797a70222e7284e45645967de3700e1f432351b',
    );
    if (!QuoteHelper.isQuoteV2(signedQuotes2[1].quote)) throw new Error('Invalid quote type');
    expect(signedQuotes2[1].quote.token).toEqual('0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6');
    expect(signedQuotes2[1].quote.startTokenId).toEqual(5000n);
    expect(signedQuotes2[1].quote.endTokenId).toEqual(5010n);
    expect(signedQuotes2[1].quote.currency).toEqual('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2');
    expect(signedQuotes2[1].quote.price).toEqual(300n * 10n ** 18n);
    expect(signedQuotes2[1].quote.timestamp).toEqual(1712301236n);
    expect(signedQuotes2[1].quote.duration).toEqual(1800n);
    expect(signedQuotes2[1].signature).toEqual(
      '0xc8a8888be93f36afdfffee6afc5213fd8c3118c80faba331fc68c29a552b38d933c0e0ff847d51c043cb4468b744a7d2612869ef2309b5bb8abaf827285515eb1c',
    );
  });
});
