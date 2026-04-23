import { Prisma } from "@prisma/client";

export function isPrismaNotFoundError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export function isPrismaUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export function withUnderscoreId<T extends { id: string }>(record: T) {
  const { id, ...rest } = record;
  return { _id: id, ...rest } as Omit<T, "id"> & { _id: string };
}

export function withUnderscoreIds<T extends { id: string }>(records: T[]) {
  return records.map(withUnderscoreId);
}

