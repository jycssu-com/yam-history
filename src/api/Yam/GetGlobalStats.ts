import { gql, GraphQLClient } from 'graphql-request'

export interface Statistics {
  offersCreatedCount: number;
  offersWithPriceChangesCount: number;
  offersDeletedCount: number;
  offersAcceptedCount: number;
  offersPrivateCount: number;
  offersActiveCount: number;
  offersEmptyCount: number;
  accountsCount: number;
  accountsWithOffersCount: number;
  accountsWithSalesCount: number;
  accountsWithPurchasesCount: number;
  accountsWithSwapsCount: number;
  transactionsCount: number;
  realTokenTradeVolume: number;
}

interface StatisticsDay extends Statistics {
  id: string;
  year: number;
  month: number;
  day: number;
}

interface StatisticsMonth extends Statistics {
  id: string;
  year: number;
  month: number;
}

export interface GlobalStats {
  statistic: Statistics;
  statisticsDays: StatisticsDay[];
  cumulativeStatisticsDays: StatisticsDay[];
  statisticsMonths: StatisticsMonth[];
  cumulativeStatisticsMonths: StatisticsMonth[];
  topTokenCurrentMonth: { token: string; volume: number }[];
  topBuyerCurrentMonth: { account: string; purchasesCount: number }[];
  topSellerCurrentMonth: { account: string; salesCount: number }[];
  topAccountCurrentMonth: { account: string; transactionsCount: number }[];
  topTokenLastMonth: { token: string; volume: number }[];
  topBuyerLastMonth: { account: string; purchasesCount: number }[];
  topSellerLastMonth: { account: string; salesCount: number }[];
  topAccountLastMonth: { account: string; transactionsCount: number }[];
}

interface TopTokenEntity {
  token: { address: string; decimals: string };
  volume: string;
}

interface TopBuyerEntity {
  account: { address: string };
  purchasesCount: string;
}

interface TopSellerEntity {
  account: { address: string };
  salesCount: string;
}

interface TopAccountEntity {
  account: { address: string };
  transactionsCount: string;
}

interface StatisticsEntity {
  offersCreatedCount: string;
  offersWithPriceChangesCount: string;
  offersDeletedCount: string;
  offersAcceptedCount: string;
  offersPrivateCount: string;
  offersActiveCount: string;
  accountsCount: string;
  accountsWithOffersCount: string;
  accountsWithSalesCount: string;
  accountsWithPurchasesCount: string;
  accountsWithSwapsCount: string;
  transactionsCount: string;
  realTokenTradeVolume: string;
}

interface StatisticsDayEntity extends StatisticsEntity {
  id: string;
  year: string;
  month: string;
  day: string;
}

interface StatisticsMonthEntity extends StatisticsEntity {
  id: string;
  year: string;
  month: string;
}

interface GetGlobalStats {
  lastCumulativeStatistics: StatisticsEntity[];
  statisticsDays: StatisticsDayEntity[];
  cumulativeStatisticsDays: StatisticsDayEntity[];
  statisticsMonths: StatisticsMonthEntity[];
  cumulativeStatisticsMonths: StatisticsMonthEntity[];
  topTokenCurrentMonth: TopTokenEntity[];
  topBuyerCurrentMonth: TopBuyerEntity[];
  topSellerCurrentMonth: TopSellerEntity[];
  topAccountCurrentMonth: TopAccountEntity[];
  topTokenLastMonth: TopTokenEntity[];
  topBuyerLastMonth: TopBuyerEntity[];
  topSellerLastMonth: TopSellerEntity[];
  topAccountLastMonth: TopAccountEntity[];
}

interface GetGlobalStatsVariables {
  currentMonth: string;
  currentMonthYear: string;
  lastMonth: string;
  lastMonthYear: string;
}

function parseStatistic (statistic: StatisticsEntity) {
  return {
    offersCreatedCount: parseInt(statistic.offersCreatedCount),
    offersWithPriceChangesCount: parseInt(statistic.offersWithPriceChangesCount),
    offersDeletedCount: parseInt(statistic.offersDeletedCount),
    offersAcceptedCount: parseInt(statistic.offersAcceptedCount),
    offersPrivateCount: parseInt(statistic.offersPrivateCount),
    offersActiveCount: parseInt(statistic.offersActiveCount),
    offersEmptyCount: parseInt(statistic.offersCreatedCount) - parseInt(statistic.offersActiveCount) - parseInt(statistic.offersDeletedCount),
    accountsCount: parseInt(statistic.accountsCount),
    accountsWithOffersCount: parseInt(statistic.accountsWithOffersCount),
    accountsWithSalesCount: parseInt(statistic.accountsWithSalesCount),
    accountsWithPurchasesCount: parseInt(statistic.accountsWithPurchasesCount),
    accountsWithSwapsCount: parseInt(statistic.accountsWithSwapsCount),
    transactionsCount: parseInt(statistic.transactionsCount),
    realTokenTradeVolume: parseInt(statistic.realTokenTradeVolume) / (10 ** 18),
  }
}

function parseStatisticsDays (statisticDays: StatisticsDayEntity[]) {
  return statisticDays.map((item) => ({
    id: item.id,
    year: parseInt(item.year),
    month: parseInt(item.month),
    day: parseInt(item.day),
    ...parseStatistic(item),
  }))
}

function parseStatisticsMonths (statisticsMonths: StatisticsMonthEntity[]) {
  return statisticsMonths.map((item) => ({
    id: item.id,
    year: parseInt(item.year),
    month: parseInt(item.month),
    ...parseStatistic(item),
  }))
}

function parseBuyers (buyers: TopBuyerEntity[]) {
  return buyers.map((item) => ({
    account: item.account.address,
    purchasesCount: parseInt(item.purchasesCount),
  }))
}

function parseSellers (sellers: TopSellerEntity[]) {
  return sellers.map((item) => ({
    account: item.account.address,
    salesCount: parseInt(item.salesCount),
  }))
}

function parseAccounts (accounts: TopAccountEntity[]) {
  return accounts.map((item) => ({
    account: item.account.address,
    transactionsCount: parseInt(item.transactionsCount),
  }))
}

function parseTokens (tokens: TopTokenEntity[]) {
  return tokens.map((item) => ({
    token: item.token.address,
    volume: parseInt(item.volume) / 10 ** parseInt(item.token.decimals),
  }))
}

function parseResult (result: GetGlobalStats): GlobalStats {
  return {
    statistic: parseStatistic(result.lastCumulativeStatistics[0]),
    statisticsDays: parseStatisticsDays(result.statisticsDays),
    cumulativeStatisticsDays: parseStatisticsDays(result.cumulativeStatisticsDays),
    statisticsMonths: parseStatisticsMonths(result.statisticsMonths),
    cumulativeStatisticsMonths: parseStatisticsMonths(result.cumulativeStatisticsMonths),
    topTokenCurrentMonth: parseTokens(result.topTokenCurrentMonth),
    topBuyerCurrentMonth: parseBuyers(result.topBuyerCurrentMonth),
    topSellerCurrentMonth: parseSellers(result.topSellerCurrentMonth),
    topAccountCurrentMonth: parseAccounts(result.topAccountCurrentMonth),
    topTokenLastMonth: parseTokens(result.topTokenLastMonth),
    topBuyerLastMonth: parseBuyers(result.topBuyerLastMonth),
    topSellerLastMonth: parseSellers(result.topSellerLastMonth),
    topAccountLastMonth: parseAccounts(result.topAccountLastMonth),
  }
}

export function getGlobalStats (client: GraphQLClient) {
  return async (variables: GetGlobalStatsVariables) => {
    const response = await client.request<GetGlobalStats>(gql`
      query GetGlobalStats (
        $currentMonth: String,
        $currentMonthYear: String,
        $lastMonth: String,
        $lastMonthYear: String
      ) {
        lastCumulativeStatistics: cumulativeStatisticMonths (
          orderBy: id,
          orderDirection: desc,
          first: 1
        ) {
          offersCreatedCount
          offersWithPriceChangesCount
          offersDeletedCount
          offersAcceptedCount
          offersPrivateCount
          offersActiveCount

          accountsCount
          accountsWithOffersCount
          accountsWithSalesCount
          accountsWithPurchasesCount
          accountsWithSwapsCount

          transactionsCount
          realTokenTradeVolume
        }
        statisticsDays: statisticDays (
          orderBy: id,
          orderDirection: desc,
          first: 30
        ) {
          id
          year
          month
          day

          offersCreatedCount
          offersWithPriceChangesCount
          offersDeletedCount
          offersAcceptedCount
          offersPrivateCount
          offersActiveCount

          accountsCount
          accountsWithOffersCount
          accountsWithSalesCount
          accountsWithPurchasesCount
          accountsWithSwapsCount

          transactionsCount
          realTokenTradeVolume
        }
        cumulativeStatisticsDays: cumulativeStatisticDays (
          orderBy: id,
          orderDirection: desc,
          first: 30
        ) {
          id
          year
          month
          day

          offersCreatedCount
          offersWithPriceChangesCount
          offersDeletedCount
          offersAcceptedCount
          offersPrivateCount
          offersActiveCount

          accountsCount
          accountsWithOffersCount
          accountsWithSalesCount
          accountsWithPurchasesCount
          accountsWithSwapsCount

          transactionsCount
          realTokenTradeVolume
        }
        statisticsMonths: statisticMonths (
          orderBy: id,
          orderDirection: desc,
          first: 12
        ) {
          id
          year
          month

          offersCreatedCount
          offersWithPriceChangesCount
          offersDeletedCount
          offersAcceptedCount
          offersPrivateCount
          offersActiveCount

          accountsCount
          accountsWithOffersCount
          accountsWithSalesCount
          accountsWithPurchasesCount
          accountsWithSwapsCount

          transactionsCount
          realTokenTradeVolume
        }
        cumulativeStatisticsMonths: cumulativeStatisticMonths (
          orderBy: id,
          orderDirection: desc,
          first: 12
        ) {
          id
          year
          month

          offersCreatedCount
          offersWithPriceChangesCount
          offersDeletedCount
          offersAcceptedCount
          offersPrivateCount
          offersActiveCount

          accountsCount
          accountsWithOffersCount
          accountsWithSalesCount
          accountsWithPurchasesCount
          accountsWithSwapsCount

          transactionsCount
          realTokenTradeVolume
        }
        topTokenCurrentMonth: tokenMonths (
          where: {
            year: $currentMonthYear
            month: $currentMonth
          },
          orderBy: volume,
          orderDirection: desc,
          first: 10
        ) {
          token { address decimals }
          volume
        }
        topBuyerCurrentMonth: accountMonths (
          where: {
            year: $currentMonthYear
            month: $currentMonth
          },
          orderBy: purchasesCount,
          orderDirection: desc,
          first: 5
        ) {
          account { address }
          purchasesCount
        }
        topSellerCurrentMonth: accountMonths (
          where: {
            year: $currentMonthYear
            month: $currentMonth
          },
          orderBy: salesCount,
          orderDirection: desc,
          first: 5
        ) {
          account { address }
          salesCount
        }
        topAccountCurrentMonth: accountMonths (
          where: {
            year: $currentMonthYear
            month: $currentMonth
          },
          orderBy: transactionsCount,
          orderDirection: desc,
          first: 5
        ) {
          account { address }
          transactionsCount
        }
        topTokenLastMonth: tokenMonths (
          where: {
            year: $lastMonthYear
            month: $lastMonth
          },
          orderBy: volume,
          orderDirection: desc,
          first: 10
        ) {
          token { address decimals }
          volume
        }
        topBuyerLastMonth: accountMonths (
          where: {
            year: $lastMonthYear
            month: $lastMonth
          },
          orderBy: purchasesCount,
          orderDirection: desc,
          first: 3
        ) {
          account { address }
          purchasesCount
        }
        topSellerLastMonth: accountMonths (
          where: {
            year: $lastMonthYear
            month: $lastMonth
          },
          orderBy: salesCount,
          orderDirection: desc,
          first: 3
        ) {
          account { address }
          salesCount
        }
        topAccountLastMonth: accountMonths (
          where: {
            year: $lastMonthYear
            month: $lastMonth
          },
          orderBy: transactionsCount,
          orderDirection: desc,
          first: 3
        ) {
          account { address }
          transactionsCount
        }
      }
    `, variables)

    return parseResult(response)
  }
}
