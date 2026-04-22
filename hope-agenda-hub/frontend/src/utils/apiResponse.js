export async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : {};
  } catch {
    return {};
  }
}

export function getErrorMessage(response, data, fallbackMessage) {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return `${fallbackMessage} (${response.status})`;
}
