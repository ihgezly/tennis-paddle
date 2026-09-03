import type { PayloadRequest } from "payload";

type PayloadTransaction = {
  execute: (query: unknown) => Promise<{
    rows?: any[];
    rowCount?: number;
  }>;
};

type PayloadWithSessions = {
  db: {
    beginTransaction: () => Promise<string | number | undefined>;
    commitTransaction: (transactionID: string | number) => Promise<void>;
    rollbackTransaction: (transactionID: string | number) => Promise<void>;
    sessions?: Record<
      string | number,
      { db: PayloadTransaction }
    >;
  };
};

export async function withPayloadTransaction<T>(
  payload: PayloadWithSessions,
  req: PayloadRequest,
  callback: (
    txReq: PayloadRequest,
    tx: PayloadTransaction,
    transactionID: string | number,
  ) => Promise<T>,
): Promise<T> {
  const transactionID = await payload.db.beginTransaction();

  if (!transactionID) {
    throw new Error("FAILED_TO_BEGIN_TRANSACTION");
  }

  try {
    const session = payload.db.sessions?.[transactionID];
    if (!session?.db) {
      throw new Error("PAYLOAD_TRANSACTION_SESSION_NOT_FOUND");
    }

    const txReq = {
      ...req,
      transactionID,
    } as PayloadRequest;

    const result = await callback(txReq, session.db, transactionID);

    await payload.db.commitTransaction(transactionID);
    return result;
  } catch (error) {
    try {
      await payload.db.rollbackTransaction(transactionID);
    } catch (rollbackError) {
      console.error("TRANSACTION ROLLBACK FAILED:", rollbackError);
    }
    throw error;
  }
}