import { NextResponse } from "next/server";
/** The browser owns persistent edits until an authenticated database is connected. */
export function browserStorageOnly() {
  return NextResponse.json(
    {
      error:
        "Server-side writes are not configured. Save through the FitJournal interface, which stores your changes on this device.",
      storage: "browser",
    },
    { status: 501 },
  );
}
