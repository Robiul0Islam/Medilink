const LS_REPORTS = "medilink_reports";

export function loadReports() {
  try {
    return JSON.parse(localStorage.getItem(LS_REPORTS)) || [];
  } catch {
    return [];
  }
}

export function saveReports(reports) {
  localStorage.setItem(LS_REPORTS, JSON.stringify(reports));
}
