import jsPDF from "jspdf";
import "jspdf-autotable";

const dayOrder = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const toMinutes = (value) => {
  if (!value || typeof value !== "string" || !value.includes(":")) {
    return 0;
  }

  const [hours, minutes] = value.split(":").map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }

  return (hours * 60) + minutes;
};

export const exportTimetablePdf = ({ entries = [], scope = null, todayDayName = "" }) => {
  if (!Array.isArray(entries) || !entries.length) {
    return;
  }

  const sortedEntries = [...entries].sort((first, second) => {
    const dayDifference = (dayOrder[first.dayOfWeek] ?? 99) - (dayOrder[second.dayOfWeek] ?? 99);
    if (dayDifference !== 0) {
      return dayDifference;
    }

    return toMinutes(first.startTime) - toMinutes(second.startTime);
  });

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 48;

  doc.setFillColor(40, 83, 161);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 88, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text("My Timetable", marginX, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, marginX, 58);

  const scopeText = scope
    ? `Semester ${scope.semester} • Group ${scope.groupNumber}`
    : "Scope not available";

  doc.text(`Scope: ${scopeText}`, marginX, 74);

  if (todayDayName) {
    doc.text(`Today: ${todayDayName}`, doc.internal.pageSize.getWidth() - marginX, 58, {
      align: "right",
    });
  }

  const tableColumns = ["Day", "Time", "Module", "Activity", "Lecturers", "Venue"];
  const tableRows = sortedEntries.map((entry) => [
    entry.dayOfWeek || "-",
    `${entry.startTime || "-"} - ${entry.endTime || "-"}`,
    `${entry.moduleCode || "-"}${entry.moduleName ? `\n${entry.moduleName}` : ""}`,
    entry.activityType || "-",
    Array.isArray(entry.lecturerNames) && entry.lecturerNames.length ? entry.lecturerNames.join(", ") : "-",
    entry.venue || "-",
  ]);

  doc.autoTable({
    startY: 108,
    head: [tableColumns],
    body: tableRows,
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [31, 41, 55],
      lineColor: [219, 231, 248],
      lineWidth: 0.45,
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
      valign: "middle",
    },
    headStyles: {
      fillColor: [64, 108, 188],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [247, 250, 255],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 82 },
      2: { cellWidth: 118 },
      3: { cellWidth: 78 },
      4: { cellWidth: 120 },
      5: { cellWidth: 68 },
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (hookData) => {
      if (hookData.section !== "body") {
        return;
      }

      const dayColumn = 0;
      const activityColumn = 3;
      const row = hookData.row.raw;

      if (hookData.column.index === dayColumn && row[dayColumn] === todayDayName) {
        hookData.cell.styles.fillColor = [236, 249, 241];
      }

      if (hookData.column.index !== activityColumn) {
        return;
      }

      const activity = String(row[activityColumn] || "").toLowerCase();
      if (activity.includes("lecture")) {
        hookData.cell.styles.textColor = [46, 98, 184];
      } else if (activity.includes("tutorial")) {
        hookData.cell.styles.textColor = [95, 77, 159];
      } else if (activity.includes("practical")) {
        hookData.cell.styles.textColor = [34, 117, 85];
      } else if (activity.includes("lab")) {
        hookData.cell.styles.textColor = [152, 83, 51];
      }
    },
  });

  const filename = `my-timetable-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
