export const CacheKey = (key: string, ttl: number = 300) => {
  return {
    key,
    ttl,
  };
};
