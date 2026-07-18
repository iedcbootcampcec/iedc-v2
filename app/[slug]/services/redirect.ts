const API_URL = process.env.NEXT_PUBLIC_REDIRECT_API_URL!;

interface RedirectResponse {
  redirect: string;
}

export async function getRedirectFromSlug(
  slug: string,
): Promise<RedirectResponse | null> {
  try {
    const res = await fetch(`${API_URL}/${slug}`, {
      next: {
        revalidate: 60 * 60 * 2, // 2 hours
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch redirect");
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getRedirectFromSubSlug(
  slug: string,
  subSlug: string,
): Promise<RedirectResponse | null> {
  try {
    const res = await fetch(`${API_URL}/${slug}/${subSlug}`, {
      next: {
        revalidate: 60 * 60 * 2,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch redirect");
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
