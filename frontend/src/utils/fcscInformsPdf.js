import jsPDF from "jspdf";
import "jspdf-autotable";

const toDisplayDate = (value, withWeekday = false) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-US", {
    weekday: withWeekday ? "short" : undefined,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const exportFcscApprovedEventsPdf = ({ events = [] }) => {
  if (!Array.isArray(events) || !events.length) {
    return;
  }

  const sortedEvents = [...events].sort((first, second) => {
    const firstTime = first?.date ? new Date(first.date).getTime() : Number.POSITIVE_INFINITY;
    const secondTime = second?.date ? new Date(second.date).getTime() : Number.POSITIVE_INFINITY;
    return firstTime - secondTime;
  });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(28, 61, 130);
  doc.rect(0, 0, pageWidth, 90, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FCSC Approved Events", marginX, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated on: ${toDisplayDate(new Date())}`, marginX, 58);
  doc.text(`Total approved events: ${sortedEvents.length}`, marginX, 74);

  doc.setTextColor(31, 41, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Event report", marginX, 118);

  const columns = [
    "#",
    "Event",
    "Title",
    "Date",
    "Venue",
    "Description",
    "Approved",
  ];

  const rows = sortedEvents.map((event, index) => [
    index + 1,
    event?.name || "-",
    event?.title || "-",
    toDisplayDate(event?.date, true),
    event?.venue || "-",
    event?.description || "-",
    toDisplayDate(event?.approvedAt),
  ]);

  doc.autoTable({
    startY: 132,
    head: [columns],
    body: rows,
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [31, 41, 55],
      lineColor: [219, 231, 248],
      lineWidth: 0.45,
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
      valign: "top",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [54, 91, 170],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [247, 250, 255],
    },
    columnStyles: {
      0: { cellWidth: 26, halign: "center" },
      1: { cellWidth: 74 },
      2: { cellWidth: 74 },
      3: { cellWidth: 64 },
      4: { cellWidth: 72 },
      5: { cellWidth: 140 },
      6: { cellWidth: 60 },
    },
    margin: { left: marginX, right: marginX },
  });

  const filename = `fcsc-approved-events-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};