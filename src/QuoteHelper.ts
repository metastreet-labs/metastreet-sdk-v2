import { Address, PrivateKeyAccount, TypedDataDomain, parseAbiParameters, encodeAbiParameters } from 'viem';

export interface Quote {
  token: Address;
  tokenId: bigint;
  currency: Address;
  price: bigint;
  timestamp: bigint;
  duration: bigint;
}

export interface SignedQuote {
  quote: Quote;
  signature: `0x${string}`;
}

/**
 * Helper class for signing price quotes for the SimpleSignedPriceOracle.
 */
export class QuoteHelper {
  static readonly QUOTE_TYPEHASH = {
    Quote: [
      { name: 'token', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'currency', type: 'address' },
      { name: 'price', type: 'uint256' },
      { name: 'timestamp', type: 'uint64' },
      { name: 'duration', type: 'uint64' },
    ],
  } as const;

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
    const quote: Quote = {
      token,
      tokenId,
      currency,
      price,
      timestamp: BigInt(timestamp),
      duration: BigInt(duration),
    };

    const signature = await signer.signTypedData({
      domain,
      types: this.QUOTE_TYPEHASH,
      primaryType: 'Quote',
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
    return encodeAbiParameters(
      parseAbiParameters(
        '((address token,uint256 tokenId,address currency,uint256 price,uint64 timestamp,uint64 duration) quote,bytes signature)[]',
      ),
      [signedQuotes],
    );
  }
}
