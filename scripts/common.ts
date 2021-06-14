export const BUILD_DIR = "_build";

export async function executeNoFail<T>(
  callback: () => Promise<T>
): Promise<T | null> {
  try {
    return await callback();
  } catch {}

  return null;
}
