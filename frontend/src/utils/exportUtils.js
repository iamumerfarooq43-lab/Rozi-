import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

// ─── PDF Export ────────────────────────────────────────────
export const exportToPDF = (earnings, range = 'This Month') => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(30, 45, 64) // navy color
    doc.text('Rozi — Earnings Report', 14, 20)

    // Subtitle
    doc.setFontSize(10)
    doc.setTextColor(120, 120, 120)
    doc.text(`Period: ${range}`, 14, 28)
    doc.text(
        `Generated: ${new Date().toLocaleDateString('en-PK', {
            day: 'numeric', month: 'long', year: 'numeric'
        })}`,
        14, 34
    )

    // Summary stats
    const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.gross_amount), 0)
    const totalRides = earnings.reduce((sum, e) => sum + Number(e.ride_count || 0), 0)

    doc.setFontSize(11)
    doc.setTextColor(30, 45, 64)
    doc.text(`Total Earnings: PKR ${totalEarnings.toLocaleString()}`, 14, 44)
    doc.text(`Total Rides: ${totalRides}`, 14, 51)
    doc.text(`Total Entries: ${earnings.length}`, 14, 58)

    // Divider
    doc.setDrawColor(200, 200, 200)
    doc.line(14, 63, 196, 63)

    // Table
    autoTable(doc, {
        startY: 68,
        head: [['Date', 'Platform', 'Amount (PKR)', 'Rides', 'Hours', 'Notes']],
        body: earnings.map(e => [
            new Date(e.date).toLocaleDateString('en-PK', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            e.platform_name,
            Number(e.gross_amount).toLocaleString(),
            e.ride_count || 0,
            e.hours_worked ? `${e.hours_worked}h` : '—',
            e.notes || '—',
        ]),
        headStyles: {
            fillColor: [99, 102, 241], // indigo
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [50, 50, 50],
        },
        alternateRowStyles: {
            fillColor: [245, 245, 250],
        },
        styles: {
            cellPadding: 3,
        },
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Rozi Earnings Tracker · Page ${i} of ${pageCount}`,
            14,
            doc.internal.pageSize.height - 10
        )
    }

    doc.save(`rozi-earnings-${Date.now()}.pdf`)
}

// ─── CSV Export ────────────────────────────────────────────
export const exportToCSV = (earnings) => {
    const data = earnings.map(e => ({
        Date: new Date(e.date).toLocaleDateString('en-PK', {
            day: 'numeric', month: 'short', year: 'numeric'
        }),
        Platform: e.platform_name,
        'Amount (PKR)': e.gross_amount,
        Rides: e.ride_count || 0,
        'Hours Worked': e.hours_worked || '',
        Notes: e.notes || '',
    }))

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `rozi-earnings-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}