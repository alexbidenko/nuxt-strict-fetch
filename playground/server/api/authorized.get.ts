export default defineEventHandler(async (event) => {
  const headers = getHeaders(event);
  const expiredAt = headers['x-expired-at']?.toString();

  if (!expiredAt) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const date = new Date(expiredAt).getTime();

  if (date < Date.now()) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return { status: true };
});
