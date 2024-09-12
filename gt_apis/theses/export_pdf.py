import datetime
import io
import os
from collections import defaultdict

from django.conf import settings
from django.core.mail import EmailMessage
from django.http import FileResponse
from reportlab.lib import colors, styles
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak


def export_pdf(data, thesis_name, email=""):
    # Create a file-like buffer to receive PDF data.
    buffer = io.BytesIO()

    filename = f"{thesis_name}_thesis_evaluation_report.pdf"
    path = '/home/Hoangila2016/Graduate-Thesis-Management-System/gt_apis/theses/static/fonts/DejaVuSans.ttf'
    # Register a TTF Font that supports Vietnamese characters
    try:
        pdfmetrics.registerFont(TTFont('DejaVuSans', path))
    except Exception as e:
        print(f"Error registering font: {e}")

    # Organize the data by criterion and lecturer

    data_by_criteria = defaultdict(list)

    # Calculate weighted scores
    total_weighted_score = 0
    total_weight = 0

    for record in data:
        key = record['tieu_chi']['tieu_chi']
        percentage = record['tieu_chi']['ty_le']
        lecturer = f"{record['gv']['first_name']} {record['gv']['last_name']}"
        score = record['diem']

        weighted_score = score * (percentage / 100)
        total_weighted_score += weighted_score
        total_weight += percentage

        data_by_criteria[key].append((score, percentage, lecturer))

    average_score = total_weighted_score / total_weight if total_weight > 0 else 0
    # Prepare data for the table
    table_data = []
    header = ['Tiêu Chí', 'Tỷ Lệ', 'Điểm', 'Giảng Viên']
    table_data.append(header)

    for criterion, values in data_by_criteria.items():
        if len(values) > 1:
            for i, (score, percentage, lecturer) in enumerate(values):
                if i == 0:
                    table_data.append([criterion, percentage, score, lecturer])
                else:
                    table_data.append(['', percentage, score, lecturer])
        else:
            score, percentage, lecturer = values[0]
            table_data.append([criterion, percentage, score, lecturer])
    table_data.append(["Điểm trung bình", "", round(average_score * 100, 2), ""])

    # Create a PDF document
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72,
                            bottomMargin=18)
    styles = getSampleStyleSheet()
    elements = []

    # Title Page
    title = Paragraph("Graduate Thesis Evaluation Report", styles['Title'])
    subtitle = Paragraph("Department of Computer Science", styles['Heading2'])
    elements.append(title)
    elements.append(Spacer(1, 12))
    elements.append(subtitle)
    # elements.append(PageBreak())

    # Table of Contents - Placeholder
    toc = Paragraph("Table of Contents", styles['Heading1'])
    elements.append(toc)
    # elements.append(PageBreak())

    # Evaluation Table
    table_title = Paragraph("Evaluation Details", styles['Heading2'])
    elements.append(table_title)
    elements.append(Spacer(1, 12))

    # Define the style of the table using the custom font
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.gray),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'DejaVuSans'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 2, colors.black),
    ])

    tbl = Table(table_data, colWidths=[150, 50, 200])
    tbl.setStyle(style)
    elements.append(tbl)

    # Signature Section
    elements.append(Spacer(1, 48))
    signatures = Paragraph("Signature Section", styles['Heading2'])
    elements.append(signatures)
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Advisor's Signature: _______________________", styles['Normal']))
    elements.append(Spacer(1, 24))
    current_date = datetime.datetime.now().strftime("%B %d, %Y")
    elements.append(Paragraph(f"Date: {current_date}", styles['Normal']))

    # Build the document
    doc.build(elements)

    try:
        with open(f'/home/Hoangila2016/Graduate-Thesis-Management-System/gt_apis/theses/static/pdf/{filename}', 'wb') as f:
            f.write(buffer.getvalue())
    except Exception as e:
        print(f"Error writing file: {e}")

    # Save PDF to a file and/or send by email
    if email:
        # Send an email
        email_subject = 'Thesis Evaluation Report'
        email_body = f'Please find attached the evaluation report for: {thesis_name}.'
        email = EmailMessage(
            email_subject,
            email_body,
            settings.EMAIL_HOST_USER,  # Specify the sender email here
            email,
            [],
            # reply_to=['other@example.com'],
            # headers={'Message-ID': 'foo'},
        )
        email.attach_file(f'/home/Hoangila2016/Graduate-Thesis-Management-System/gt_apis/theses/static/pdf/{filename}')
        email.send()

    buffer.seek(0)
    # FileResponse sets the Content-Disposition header so that browsers
    # present the option to save the file.
    return FileResponse(buffer, as_attachment=True, filename=filename)
