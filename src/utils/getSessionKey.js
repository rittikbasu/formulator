export async function getSessionKey(year) {
  const currentYear = new Date().getFullYear().toString();
  if (year === currentYear) {
    return "latest";
  }

  try {
    const sessionsResponse = await fetch(
      `https://api.openf1.org/v1/sessions?session_name=Race&year=${year}`
    );
    const sessionsData = await sessionsResponse.json();
    const lastSession = sessionsData[sessionsData.length - 1];
    return lastSession.session_key;
  } catch (error) {
    console.error("Error fetching session data:", error);
    return "latest";
  }
}
