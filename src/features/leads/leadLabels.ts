export function leadStatusKey(status: string) {
  const statusKeys: Record<string, string> = {
    ASSIGNED: "status.assigned",
    CLOSED_LOST: "status.closedLost",
    CLOSED_WON: "status.closedWon",
    CONTACTED: "status.contacted",
    INTERESTED: "status.interested",
    INVALID: "status.invalid",
    NEGOTIATING: "status.negotiating",
    NEW: "status.new",
    VIEWING_SCHEDULED: "status.viewingScheduled"
  };

  return statusKeys[status] ?? status;
}
