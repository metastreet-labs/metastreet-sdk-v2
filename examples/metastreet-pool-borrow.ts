/*
  MetaStreet v2 Pool Borrow Example (standalone)

  $ mkdir sandbox; cd sandbox
  $ npm init -y
  $ npm i -D ts-node graphql-request @metastreet/sdk-v2 ethers
  $ npx ts-node metastreet-pool-borrow.ts <pool address>

*/

import { GraphQLClient, gql } from 'graphql-request';
import { TickRouter, LiquidityNode } from '@metastreet/sdk-v2';
import { ethers } from 'ethers';

const SUBGRAPH_URI = 'https://api.thegraph.com/subgraphs/name/metastreet-labs/metastreet-v2-beta';

const PoolQuery = gql`
  query ($poolAddress: ID!) {
    pool(id: $poolAddress) {
      collateralToken {
        id
        name
      }
      currencyToken {
        symbol
      }
      rates
      durations
      ticks(orderBy: "raw", orderDirection: "asc", where: { value_gt: 0 }) {
        raw
        available
      }
    }
  }
`;

type PoolInfo = {
  collateralToken: {
    id: string;
    name: string;
  };
  currencyToken: {
    symbol: string;
  };
  rates: string[];
  durations: string[];
  ticks: {
    raw: string;
    available: string;
  }[];
};

async function main() {
  if (process.argv.length < 3) {
    console.log(`Usage: metastreet-pool-borrow <pool address>`);
    process.exitCode = 1;
    process.exit();
  }

  /* Construct GraphQL client to subgraph */
  const graphQLClient = new GraphQLClient(SUBGRAPH_URI);

  /* Fetch Pool Info */
  const poolInfo = (
    (await graphQLClient.request(PoolQuery, { poolAddress: process.argv[2].toLowerCase() })) as { pool: PoolInfo }
  ).pool as PoolInfo;

  /* Construct tick router */
  const tickRouter = new TickRouter(poolInfo.durations.map(Number), poolInfo.rates.map(BigInt));

  /* Construct interface */
  const iface = new ethers.Interface([
    'function borrow(uint256 principal, uint64 duration, address collateralToken, uint256 collateralTokenId, uint256 maxRepayment, uint128[] calldata ticks, bytes calldata options)',
  ]);

  /* Construct liquidity nodes */
  const nodes: LiquidityNode[] = poolInfo.ticks.map((tick) => ({
    tick: BigInt(tick.raw),
    available: BigInt(tick.available),
  }));

  console.log(`Pool ${process.argv[2]} (${poolInfo.collateralToken.name} - ${poolInfo.currencyToken.symbol})\n`);

  /* For each supported Pool duration */
  for (const duration of tickRouter.durations) {
    /* Compute available principal */
    const principal = tickRouter.forecast(nodes, duration);
    if (principal === 0n) continue;

    /* Route ticks */
    const ticks = tickRouter.route(nodes, principal, duration)[0];
    /* Compute repayment */
    const repayment = tickRouter.quote(nodes, ticks, principal, duration);
    /* Compute max repayment (5% slippage on interest) */
    const maxRepayment = repayment + ((repayment - principal) * 500n) / 10000n;

    console.log(
      `    borrow(${principal} /* principal */, ${duration} /* duration */, ${poolInfo.collateralToken.id} /* collateralToken */, 123 /* collateralTokenId (example) */, ${maxRepayment} /* maxRepayment */, [${ticks}] /* ticks */, "0x" /* options */)`,
    );
    console.log(
      `    ${iface.encodeFunctionData('borrow', [
        principal,
        duration,
        poolInfo.collateralToken.id,
        123n,
        maxRepayment,
        ticks,
        '0x',
      ])}\n`,
    );
  }

  process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
