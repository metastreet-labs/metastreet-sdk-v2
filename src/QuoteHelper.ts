import {
  Address,
  PrivateKeyAccount,
  TypedDataDomain,
  parseAbiParameters,
  encodeAbiParameters,
  decodeAbiParameters,
} from 'viem';

export interface QuoteV1 {
  token: Address;
  tokenId: bigint;
  currency: Address;
  price: bigint;
  timestamp: bigint;
  duration: bigint;
}

export interface QuoteV2 {
  token: Address;
  startTokenId: bigint;
  endTokenId: bigint;
  currency: Address;
  price: bigint;
  timestamp: bigint;
  duration: bigint;
}

export interface SignedQuote {
  quote: QuoteV1 | QuoteV2;
  signature: `0x${string}`;
}

/**
 * Helper class for signing price quotes for the SimpleSignedPriceOracle.
 */
export class QuoteHelper {
  static readonly QUOTE_TYPEHASH_V1 = {
    Quote: [
      { name: 'token', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'currency', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'duration', type: 'uint64' },
    ],
  } as const;

  static readonly QUOTE_TYPEHASH_V2 = {
    QuoteV2: [
      { name: 'token', type: 'address' },
      { name: 'startTokenId', type: 'uint256' },
      { name: 'endTokenId', type: 'uint256' },
      { name: 'currency', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'duration', type: 'uint64' },
    ],
  } as const;

  /**
   * Type guard for QuoteV1.
   * @param quote Quote
   * @return Quote is type QuoteV1
   */
  static isQuoteV1(quote: QuoteV1 | QuoteV2): quote is QuoteV1 {
    return 'tokenId' in quote;
  }

  /**
   * Type guard for QuoteV2
   * @param quote Quote
   * @return Quote is type QuoteV2
   */
  static isQuoteV2(quote: QuoteV1 | QuoteV2): quote is QuoteV2 {
    return 'startTokenId' in quote;
  }

  /**
   * Sign a price quote.
   * @param signer Signer
   * @param domain EIP-712 domain
   * @param token Collateral token address
   * @param tokenId Collateral token ID
   * @param currency Currency token address
   * @param price Price in currency tokens
   * @param timestamp Signing timestamp (UNIX)
   * @param duration Validity duration in seconds
   * @return Signed quote
   */
  static async signQuote(
    signer: PrivateKeyAccount,
    domain: TypedDataDomain,
    token: Address,
    tokenId: bigint,
    currency: Address,
    price: bigint,
    timestamp: number | bigint,
    duration: number | bigint,
  ): Promise<SignedQuote> {
    const quote: QuoteV1 = {
      token,
      tokenId,
      currency,
      price,
      timestamp: BigInt(timestamp),
      duration: BigInt(duration),
    };

    const signature = await signer.signTypedData({
      domain,
      types: this.QUOTE_TYPEHASH_V1,
      primaryType: 'Quote',
      message: quote,
    });

    return { quote, signature };
  }

  /**
   * Sign a ranged price quote.
   * @param signer Signer
   * @param domain EIP-712 domain
   * @param token Collateral token address
   * @param startTokenId Collateral token ID start
   * @param endTokenId Collateral token ID end
   * @param currency Currency token address
   * @param price Price in currency tokens
   * @param timestamp Signing timestamp (UNIX)
   * @param duration Validity duration in seconds
   * @return Signed quote
   */
  static async signRangedQuote(
    signer: PrivateKeyAccount,
    domain: TypedDataDomain,
    token: Address,
    startTokenId: bigint,
    endTokenId: bigint,
    currency: Address,
    price: bigint,
    timestamp: number | bigint,
    duration: number | bigint,
  ): Promise<SignedQuote> {
    const quote: QuoteV2 = {
      token,
      startTokenId,
      endTokenId,
      currency,
      price,
      timestamp: BigInt(timestamp),
      duration: BigInt(duration),
    };

    const signature = await signer.signTypedData({
      domain,
      types: this.QUOTE_TYPEHASH_V2,
      primaryType: 'QuoteV2',
      message: quote,
    });

    return { quote, signature };
  }

  /**
   * Encode signed price quotes into an oracle context payload.
   * @param signedQuotes Signed quotes
   * @return Oracle context payload
   */
  static encodeQuotes(signedQuotes: SignedQuote[]): `0x${string}` {
    if (this.isQuoteV1(signedQuotes[0].quote)) {
      return encodeAbiParameters(
        parseAbiParameters(
          '((address token,uint256 tokenId,address currency,uint256 price,uint64 timestamp,uint64 duration) quote,bytes signature)[]',
        ),
        [signedQuotes as { quote: QuoteV1; signature: `0x${string}` }[]],
      );
    } else if (this.isQuoteV2(signedQuotes[0].quote)) {
      return encodeAbiParameters(
        parseAbiParameters(
          '((address token,uint256 startTokenId,uint256 endTokenId,address currency,uint256 price,uint64 timestamp,uint64 duration) quote,bytes signature)[]',
        ),
        [signedQuotes as { quote: QuoteV2; signature: `0x${string}` }[]],
      );
    } else {
      throw new Error(`Unsupported quote type`);
    }
  }

  /**
   * Decode an oracle context payload into signed quotes.
   * @param oracleContext Oracle context
   * @param version Quote version (1 or 2)
   * @return Signed quotes
   */
  static decodeQuotes(oracleContext: `0x${string}`, version: number = 1): readonly SignedQuote[] {
    if (version === 1) {
      return decodeAbiParameters(
        parseAbiParameters(
          '((address token,uint256 tokenId,address currency,uint256 price,uint64 timestamp,uint64 duration) quote,bytes signature)[]',
        ),
        oracleContext,
      )[0];
    } else if (version === 2) {
      return decodeAbiParameters(
        parseAbiParameters(
          '((address token,uint256 startTokenId,uint256 endTokenId,address currency,uint256 price,uint64 timestamp,uint64 duration) quote,bytes signature)[]',
        ),
        oracleContext,
      )[0];
    } else {
      throw new Error(`Unsupported quote version`);
    }
  }
}
