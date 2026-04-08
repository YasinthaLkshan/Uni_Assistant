import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportGpaHistoryPdf = ({ user, entries, stats }) => {
  if (!entries.length) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 56;
  const marginY = 56;

  const studentName = user?.fullName || user?.name || user?.email || "Student";

  // Header band
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(0, 0, doc.internal.pageSize.getWidth(), 90, 0, 0, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("GPA Report", marginX, 40);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Student: ${studentName}`, marginX, 60);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, marginX, 76);

  // Subtle divider under header
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.6);
  doc.line(marginX, 94, doc.internal.pageSize.getWidth() - marginX, 94);

  if (stats) {
    const rightX = doc.internal.pageSize.getWidth() - marginX;
    doc.setFont("helvetica", "bold");
    doc.text(`Best GPA: ${stats.bestGpa.toFixed(2)}`, rightX, 40, { align: "right" });
    doc.text(`Average GPA: ${stats.averageGpa.toFixed(2)}`, rightX, 56, { align: "right" });
    doc.text(`Saved calculations: ${stats.count}`, rightX, 72, { align: "right" });
  }

  // Intro
  let cursorY = marginY + 60;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Semester summary", marginX, cursorY);

  cursorY += 18;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(
    "Each row below represents a saved semester GPA from your Uni Assistant history.",
    marginX,
    cursorY
  );

  cursorY += 26;

  const tableColumns = [
    { header: "#", dataKey: "index" },
    { header: "Semester", dataKey: "semester" },
    { header: "Course", dataKey: "course" },
    { header: "GPA", dataKey: "gpa" },
    { header: "Credits", dataKey: "credits" },
  ];

  const tableBody = entries
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    })
    .map((entry, index) => {
      return {
        index: index + 1,
        semester: entry.semesterLabel || entry.semesterKey || "-",
        course: entry.courseLabel || "-",
        gpa: typeof entry.gpa === "number" ? entry.gpa.toFixed(2) : "-",
        credits: entry.totalCredits != null ? String(entry.totalCredits) : "-",
      };
    });

  doc.autoTable({
    startY: cursorY,
    head: [tableColumns.map((col) => col.header)],
    body: tableBody.map((row) => tableColumns.map((col) => row[col.dataKey])),
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [31, 41, 55],
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [239, 246, 255],
    },
    margin: { left: marginX, right: marginX },
    didParseCell: (hookData) => {
      const { section, column, row } = hookData;
      if (section !== "body") return;

      const gpaColumnIndex = tableColumns.findIndex((col) => col.dataKey === "gpa");
      if (column.index !== gpaColumnIndex) return;

      const rawGpa = parseFloat(row.raw[gpaColumnIndex]);
      if (Number.isNaN(rawGpa)) return;

      if (rawGpa >= 3.7) {
        hookData.cell.styles.textColor = [22, 163, 74]; // success green
      } else if (rawGpa >= 3.0) {
        hookData.cell.styles.textColor = [234, 179, 8]; // amber
      } else {
        hookData.cell.styles.textColor = [239, 68, 68]; // red
      }
    },
  });

  const filename = `gpa-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
