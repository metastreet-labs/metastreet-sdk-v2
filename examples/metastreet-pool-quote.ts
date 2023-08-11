/*
  MetaStreet v2 Pool Quote Example (standalone)

  $ mkdir sandbox; cd sandbox
  $ npm init -y
  $ npm i -D ts-node graphql-request @metastreet/sdk-v2 decimal.js
  $ npx ts-node metastreet-pool-quote.ts <pool address>

*/

import { GraphQLClient, gql } from 'graphql-request';
import { TickRouter, LiquidityNode } from '@metastreet/sdk-v2';
import { Decimal } from 'decimal.js';

const SUBGRAPH_URI = 'https://api.thegraph.com/subgraphs/name/metastreet-labs/metastreet-v2-beta';

const PoolQuery = gql`
  query ($poolAddress: ID!) {
    pool(id: $poolAddress) {
      collateralToken {
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
    console.log(`Usage: metastreet-pool-quote <pool address>`);
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

  /* Construct liquidity nodes */
  const nodes: LiquidityNode[] = poolInfo.ticks.map((tick) => ({
    tick: BigInt(tick.raw),
    available: BigInt(tick.available),
  }));

  console.log(`Pool ${process.argv[2]} (${poolInfo.collateralToken.name} - ${poolInfo.currencyToken.symbol})`);

  /* For each supported Pool duration */
  for (const duration of tickRouter.durations) {
    /* Compute maximum principal and corresponding repayment at duration */
    const principal = tickRouter.forecast(nodes, duration);
    const ticks = tickRouter.route(nodes, principal, duration)[0];
    const repayment = principal !== 0n ? tickRouter.quote(nodes, ticks, principal, duration) : 0n;

    /* Convert values from bigint to Decimal */
    const principalDecimal = new Decimal(principal.toString()).div('1e18');
    const repaymentDecimal = new Decimal(repayment.toString()).div('1e18');

    /* Compute APR */
    const apr = repaymentDecimal
      .div(principalDecimal)
      .sub(1)
      .mul(365 * 86400)
      .div(duration)
      .mul(100);

    if (principal === 0n) {
      console.log(`  Duration: ${(duration / 86400).toFixed(0)} days - Unavailable`);
    } else {
      console.log(
        `  Duration: ${(duration / 86400).toFixed(0)} days, Max Principal: ${principalDecimal} ${
          poolInfo.currencyToken.symbol
        }, Repayment: ${repaymentDecimal} ${poolInfo.currencyToken.symbol}, APR: ${apr.toFixed(2)}%`,
      );
    }
  }

  process.exit();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
