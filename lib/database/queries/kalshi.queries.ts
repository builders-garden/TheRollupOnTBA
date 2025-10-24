import { and, desc, eq, type ExtractTablesWithRelations } from "drizzle-orm";
import { db, type db as dbType } from "@/lib/database";
import {
  kalshiEventsTable,
  kalshiMarketsTable,
  type CreateKalshiEvent,
  type CreateKalshiMarket,
  type KalshiEvent,
  type KalshiMarket,
} from "@/lib/database/db.schema";

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Create a new Kalshi event with all its markets
 */
export const createKalshiEventWithMarkets = async (
  eventData: CreateKalshiEvent,
  marketsData: CreateKalshiMarket[],
): Promise<{ event: KalshiEvent; markets: KalshiMarket[] }> => {
  return await db.transaction(async (tx: Transaction) => {
    // Insert the event first
    const [event] = await tx
      .insert(kalshiEventsTable)
      .values(eventData)
      .returning();

    // Insert all markets for this event
    const markets = await tx
      .insert(kalshiMarketsTable)
      .values(
        marketsData.map((market) => ({
          ...market,
          eventId: event.id,
        })),
      )
      .returning();

    return { event, markets };
  });
};

/**
 * Get a Kalshi event by brand ID and Kalshi event ID
 */
export const getKalshiEventByBrandAndEventId = async (
  brandId: string,
  kalshiEventId: string,
): Promise<KalshiEvent | null> => {
  const [event] = await db
    .select()
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.kalshiEventId, kalshiEventId),
      ),
    )
    .limit(1);

  return event || null;
};

/**
 * Get a Kalshi event with all its markets by event ID
 */
export const getKalshiEventWithMarkets = async (
  eventId: string,
): Promise<{ event: KalshiEvent; markets: KalshiMarket[] } | null> => {
  const event = await db
    .select()
    .from(kalshiEventsTable)
    .where(eq(kalshiEventsTable.id, eventId))
    .limit(1);

  if (!event[0]) {
    return null;
  }

  const markets = await db
    .select()
    .from(kalshiMarketsTable)
    .where(eq(kalshiMarketsTable.eventId, eventId))
    .orderBy(desc(kalshiMarketsTable.yesPercentage)); // Order by highest yes percentage

  return { event: event[0], markets };
};

/**
 * Get all Kalshi events for a brand
 */
export const getKalshiEventsByBrand = async (
  brandId: string,
): Promise<KalshiEvent[]> => {
  return await db
    .select()
    .from(kalshiEventsTable)
    .where(eq(kalshiEventsTable.brandId, brandId))
    .orderBy(desc(kalshiEventsTable.createdAt));
};

/**
 * Get all Kalshi events with their markets for a brand
 */
export const getKalshiEventsWithMarketsByBrand = async (
  brandId: string,
): Promise<{ event: KalshiEvent; markets: KalshiMarket[] }[]> => {
  const events = await db
    .select()
    .from(kalshiEventsTable)
    .where(eq(kalshiEventsTable.brandId, brandId))
    .orderBy(desc(kalshiEventsTable.createdAt));

  const result = await Promise.all(
    events.map(async (event: KalshiEvent) => {
      const markets = await db
        .select()
        .from(kalshiMarketsTable)
        .where(eq(kalshiMarketsTable.eventId, event.id))
        .orderBy(desc(kalshiMarketsTable.yesPercentage));

      return { event, markets };
    }),
  );

  return result;
};

/**
 * Update a Kalshi event
 */
export const updateKalshiEvent = async (
  eventId: string,
  updateData: Partial<CreateKalshiEvent>,
): Promise<KalshiEvent | null> => {
  const [updatedEvent] = await db
    .update(kalshiEventsTable)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kalshiEventsTable.id, eventId))
    .returning();

  return updatedEvent || null;
};

/**
 * Update a Kalshi market
 */
export const updateKalshiMarket = async (
  marketId: string,
  updateData: Partial<CreateKalshiMarket>,
): Promise<KalshiMarket | null> => {
  const [updatedMarket] = await db
    .update(kalshiMarketsTable)
    .set({
      ...updateData,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(kalshiMarketsTable.id, marketId))
    .returning();

  return updatedMarket || null;
};

/**
 * Update all markets for an event (useful for refreshing prices)
 */
export const updateKalshiEventMarkets = async (
  eventId: string,
  marketsData: Partial<CreateKalshiMarket>[],
): Promise<KalshiMarket[]> => {
  return await db.transaction(async (tx: Transaction) => {
    const updatedMarkets = await Promise.all(
      marketsData.map(async (marketData) => {
        const [updatedMarket] = await tx
          .update(kalshiMarketsTable)
          .set({
            ...marketData,
            updatedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(kalshiMarketsTable.eventId, eventId),
              eq(
                kalshiMarketsTable.kalshiMarketTicker,
                marketData.kalshiMarketTicker!,
              ),
            ),
          )
          .returning();

        return updatedMarket;
      }),
    );

    return updatedMarkets.filter(Boolean) as KalshiMarket[];
  });
};

/**
 * Delete a Kalshi event and all its markets
 */
export const deleteKalshiEvent = async (eventId: string): Promise<boolean> => {
  try {
    await db.transaction(async (tx: Transaction) => {
      // Delete markets first (due to foreign key constraint)
      await tx
        .delete(kalshiMarketsTable)
        .where(eq(kalshiMarketsTable.eventId, eventId));

      // Delete the event
      await tx
        .delete(kalshiEventsTable)
        .where(eq(kalshiEventsTable.id, eventId));
    });

    return true;
  } catch (error) {
    console.error("Error deleting Kalshi event:", error);
    return false;
  }
};

/**
 * Check if a Kalshi event already exists for a brand
 */
export const kalshiEventExists = async (
  brandId: string,
  kalshiEventId: string,
): Promise<boolean> => {
  const [event] = await db
    .select({ id: kalshiEventsTable.id })
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.kalshiEventId, kalshiEventId),
      ),
    )
    .limit(1);

  return !!event;
};

/**
 * Get active Kalshi events for a brand
 */
export const getActiveKalshiEventsByBrand = async (
  brandId: string,
): Promise<KalshiEvent[]> => {
  return await db
    .select()
    .from(kalshiEventsTable)
    .where(
      and(
        eq(kalshiEventsTable.brandId, brandId),
        eq(kalshiEventsTable.eventStatus, "active"),
      ),
    )
    .orderBy(desc(kalshiEventsTable.createdAt));
};

/**
 * Get markets for an event ordered by yes percentage (highest first)
 */
export const getKalshiMarketsByEventId = async (
  eventId: string,
): Promise<KalshiMarket[]> => {
  return await db
    .select()
    .from(kalshiMarketsTable)
    .where(eq(kalshiMarketsTable.eventId, eventId))
    .orderBy(desc(kalshiMarketsTable.yesPercentage));
};
