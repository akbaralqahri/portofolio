from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
OUTPUT_PDF = OUTPUT_DIR / "Muhammad_Ali_Akbar_Al-Qahri_Resume.pdf"
WEBSITE_PDF = ROOT / "Muhammad_Ali_Akbar_Al-Qahri_Resume.pdf"

PAGE_W, PAGE_H = A4
LEFT = 40
RIGHT = 40
TOP = 34
BOTTOM = 34
CONTENT_W = PAGE_W - LEFT - RIGHT

INK = colors.HexColor("#111111")
MUTED = colors.HexColor("#3F3F3F")
PAPER = colors.white


def draw_page(canvas, _doc):
    """Keep the PDF visually neutral and expose useful document metadata."""
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setTitle("Muhammad Ali Akbar Al-Qahri - Data Intelligence Resume")
    canvas.setAuthor("Muhammad Ali Akbar Al-Qahri")
    canvas.setSubject(
        "ATS resume covering data analytics, data science, and data engineering"
    )
    canvas.setKeywords(
        "Data Intelligence, Data Analyst, Data Scientist, Data Engineer, "
        "Power BI, Python, SQL, Forecasting"
    )
    canvas.restoreState()


styles = getSampleStyleSheet()

name_style = ParagraphStyle(
    "Name",
    parent=styles["Normal"],
    fontName="Times-Bold",
    fontSize=21,
    leading=22,
    textColor=INK,
    alignment=TA_CENTER,
    spaceAfter=2,
)
role_style = ParagraphStyle(
    "Role",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=11,
    leading=13,
    textColor=INK,
    alignment=TA_CENTER,
    spaceAfter=2,
)
contact_style = ParagraphStyle(
    "Contact",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=9.1,
    leading=11.5,
    textColor=INK,
    alignment=TA_CENTER,
    spaceAfter=0,
)
section_style = ParagraphStyle(
    "Section",
    parent=styles["Normal"],
    fontName="Times-Bold",
    fontSize=11.3,
    leading=13,
    textColor=INK,
    spaceBefore=7,
    spaceAfter=0.5,
)
summary_style = ParagraphStyle(
    "Summary",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=9.8,
    leading=13.2,
    textColor=INK,
    alignment=TA_JUSTIFY,
    spaceAfter=2,
)
entry_left_style = ParagraphStyle(
    "EntryLeft",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=9.8,
    leading=11.6,
    textColor=INK,
    alignment=TA_LEFT,
)
entry_right_style = ParagraphStyle(
    "EntryRight",
    parent=entry_left_style,
    alignment=TA_RIGHT,
)
bullet_style = ParagraphStyle(
    "Bullet",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=9.6,
    leading=12.5,
    textColor=INK,
    leftIndent=10,
    firstLineIndent=-7,
    bulletFontName="Times-Roman",
    bulletFontSize=9.6,
    spaceAfter=1.2,
)
compact_style = ParagraphStyle(
    "Compact",
    parent=styles["Normal"],
    fontName="Times-Roman",
    fontSize=9.6,
    leading=12.5,
    textColor=INK,
    spaceAfter=1.2,
)
project_detail_style = ParagraphStyle(
    "ProjectDetail",
    parent=bullet_style,
    fontSize=9.5,
    leading=12.3,
    spaceAfter=1.2,
)


def section(title):
    return KeepTogether(
        [
            Paragraph(title.upper(), section_style),
            HRFlowable(
                width="100%",
                thickness=0.8,
                color=INK,
                spaceBefore=0,
                spaceAfter=2,
            ),
        ]
    )


def bullet(text, style=bullet_style):
    return Paragraph(text, style, bulletText="-")


def two_column_rows(rows, left_width=CONTENT_W - 120):
    table = Table(
        [
            [Paragraph(left, entry_left_style), Paragraph(right, entry_right_style)]
            for left, right in rows
        ],
        colWidths=[left_width, CONTENT_W - left_width],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return table


def job(title, company, dates, location, bullets):
    items = [
        two_column_rows(
            [
                (f"<b>{title}</b>", f"<b>{dates}</b>"),
                (f"<i>{company}</i>", f"<i>{location}</i>"),
            ]
        )
    ]
    items.extend(bullet(item) for item in bullets)
    items.append(Spacer(1, 3))
    return KeepTogether(items)


def education(degree, institution, dates, location, detail):
    return KeepTogether(
        [
            two_column_rows(
                [
                    (f"<b>{degree}</b>", f"<b>{dates}</b>"),
                    (f"<i>{institution}</i>", f"<i>{location}</i>"),
                ]
            ),
            Paragraph(detail, compact_style),
        ]
    )


def project(title, roles, year, tech, descriptions):
    items = [
        two_column_rows(
            [(f"<b>{title}</b> | <i>{tech}</i>", f"<b>{year}</b>")],
            left_width=CONTENT_W - 45,
        )
    ]
    for index, description in enumerate(descriptions):
        prefix = f"<b>{roles}:</b> " if index == 0 else ""
        items.append(
            Paragraph(
                f"{prefix}{description}",
                project_detail_style,
                bulletText="-",
            )
        )
    items.append(Spacer(1, 1.5))
    return KeepTogether(items)


def build_story():
    story = [
        Paragraph("Muhammad Ali Akbar Al-Qahri", name_style),
        Paragraph(
            "Data Intelligence | Data Analyst | Data Scientist | Data Engineer",
            role_style,
        ),
        Paragraph(
            "+62 852-1194-4977 | "
            '<link href="mailto:akbaralqahri@gmail.com" color="#111111">akbaralqahri@gmail.com</link>'
            " | Bandung, Indonesia",
            contact_style,
        ),
        Paragraph(
            '<link href="https://linkedin.com/in/akbaralqahri" color="#111111">linkedin.com/in/akbaralqahri</link>'
            " | "
            '<link href="https://github.com/akbaralqahri" color="#111111">github.com/akbaralqahri</link>'
            " | "
            '<link href="https://akbaralqahri.github.io/portofolio/" color="#111111">akbaralqahri.github.io/portofolio</link>',
            contact_style,
        ),
        Spacer(1, 2),
        section("Professional Summary"),
        Paragraph(
            "Data Intelligence professional with hands-on experience across data analytics, "
            "data science, and data engineering. Builds MySQL-to-Power BI reporting pipelines, "
            "production forecasting systems, and deployed decision-support applications. "
            "Delivered 8 strategic dashboards, reduced reporting time by 40%, and automated "
            "10K+ records for 200+ users while maintaining data quality, model validation, and "
            "stakeholder-ready communication.",
            summary_style,
        ),
        section("Education"),
        education(
            "Bachelor of Science in Data Science",
            "Telkom University",
            "Aug 2021 - Feb 2025",
            "Bandung, Indonesia",
            "GPA: <b>3.74 / 4.00</b>",
        ),
        section("Professional Experience"),
        job(
            "Data Analyst",
            "PT Cerebrum Edukanesia Nusantara",
            "Nov 2025 - Present",
            "Bandung, Indonesia",
            [
                "Re-architected forecasting data retrieval from application-side transfers of millions of raw rows to daily SQL aggregates in the MySQL <b>_AllinMain</b> warehouse, reducing each metric pull to approximately three records per day.",
                "Built a multivariate Prophet forecasting service with FastAPI, rolling-origin cross-validation, event-phase detection, what-if scenarios, persistent caching, and optional API-key protection.",
                "Prepared, transformed, and modeled MySQL data for Power BI KPI dashboards supporting operational monitoring and strategic reporting.",
            ],
        ),
        job(
            "Database Engineer (Freelance)",
            "Garda Abdi Negara",
            "Jun 2025 - Nov 2025",
            "Remote",
            [
                "Developed a Google Gemini API text-processing solution with <b>92% accuracy</b>.",
                "Automated conversion of <b>10K+ test questions</b> for <b>200+ users</b>, reducing processing time by <b>75%</b>.",
            ],
        ),
        job(
            "Data Science Teaching Assistant",
            "Telkom University",
            "Feb 2024 - Jun 2025",
            "Bandung, Indonesia",
            [
                "Improved student performance by <b>30%</b> through Python and SQL workshops and evaluated <b>500+ assignments</b>.",
            ],
        ),
        job(
            "Data Analyst Intern",
            "Bank Indonesia - South Sulawesi Representative Office",
            "Jul 2024 - Oct 2024",
            "Makassar, Indonesia",
            [
                "Delivered <b>8 strategic Power BI dashboards</b> with <b>85% stakeholder satisfaction</b> for regional performance monitoring.",
                "Reduced reporting time by <b>40%</b> through dashboard automation across <b>5 regional branches</b>.",
            ],
        ),
        section("Technical Skills"),
        Paragraph(
            "<b>Analytics &amp; BI:</b> SQL, Power BI, Looker Studio, Tableau, Excel, KPI design, financial analytics, stakeholder reporting",
            compact_style,
        ),
        Paragraph(
            "<b>Data Science:</b> Python, pandas, NumPy, scikit-learn, Prophet, Random Forest, XGBoost, SVM, time-series forecasting, rolling-origin validation",
            compact_style,
        ),
        Paragraph(
            "<b>Data Engineering:</b> MySQL, ETL, dimensional modeling, data validation, feature engineering, Git, Google Cloud",
            compact_style,
        ),
        Paragraph(
            "<b>Applications &amp; APIs:</b> FastAPI, Streamlit, REST APIs, Plotly, Leaflet, Gemini API",
            compact_style,
        ),
        PageBreak(),
        section("Projects"),
        project(
            "Cerebrum Multivariate Forecasting",
            "Data Scientist / Data Engineer",
            "2026",
            "Prophet, FastAPI, MySQL, Plotly",
            [
                "Created a production-oriented multivariate forecasting platform backed by warehouse-level SQL aggregation.",
                "Implemented rolling-origin cross-validation, event-phase detection, what-if scenarios, correlation analysis, and persistent caching.",
            ],
        ),
        project(
            "Data Analyst Internship Portfolio",
            "Data Analyst / Data Engineer",
            "2026",
            "MySQL, ETL, Star Schema, Power BI",
            [
                "Built a multi-database ETL workflow and dimensional warehouse powering four production Power BI dashboards.",
                "Documented 120 internship tasks as a reproducible end-to-end business intelligence case study.",
            ],
        ),
        project(
            "Peta Pendidikan Tinggi Indonesia",
            "Data Analyst / Data Engineer",
            "2026",
            "JavaScript, Leaflet, Node.js, PDDIKTI",
            [
                "Mapped 5,433 institutions across 38 provinces and 514 cities/regencies in an interactive education intelligence application.",
                "Supported the application with an offline-ready pipeline and 34 independent data-quality checks.",
            ],
        ),
        project(
            "Food Security Forecasting Dashboard",
            "Data Scientist",
            "2025",
            "Random Forest, Time Series, Streamlit, Plotly",
            [
                "Achieved <b>R2 = 0.851</b> for food security forecasting across 34 Indonesian provinces.",
                "Applied time-series cross-validation, automated validation, feature importance, and provincial risk assessment.",
            ],
        ),
        project(
            "Stock Minimum Price Classification",
            "Data Scientist",
            "2025",
            "XGBoost, SVM, Cramer's V, Financial ML",
            [
                "Evaluated 1,023 feature combinations and achieved 89% classification accuracy for stock minimum-price classification.",
                "Received Best Paper at ICoDSA 2025 and publication in IEEE proceedings.",
            ],
        ),
        project(
            "SNPMB Analyst",
            "Data Analyst / Data Scientist",
            "2026",
            "Python, Streamlit, Plotly, Education Analytics",
            [
                "Built an interactive SNBT and SNBP decision-support application using 2021-2026 capacity and applicant data.",
                "Delivered program exploration, admission simulation, recommendations, and personal wishlists.",
            ],
        ),
        project(
            "IPO Terminal - Indonesia Stock Exchange",
            "Data Analyst",
            "2026",
            "Financial Analytics, Valuation, Data Visualization",
            [
                "Developed an interactive research terminal comparing six Indonesian issuers.",
                "Integrated valuation, capital-needs analysis, ARA scenarios, listing calendars, and investor scorecards.",
            ],
        ),
        project(
            "Financial Planner Dashboard",
            "Data Analyst",
            "2026",
            "Python, Streamlit, Scenario Planning",
            [
                "Created a personal-finance command center with an instant financial-health score.",
                "Combined budgeting, emergency-fund planning, debt payoff, financial goals, and FIRE simulation.",
            ],
        ),
        section("Achievements & Leadership"),
        bullet(
            '<b>Best Paper Award, ICoDSA 2025</b> - Published in IEEE proceedings; '
            '<link href="https://doi.org/10.1109/ICoDSA67155.2025.11157479" color="#111111"><u>DOI: 10.1109/ICoDSA67155.2025.11157479</u></link>.'
        ),
        bullet("<b>Top 3 Final Project</b> - MySkill Data Analysis Bootcamp, 2025."),
        bullet("<b>Patent Holder</b> - Educational Software, Patent No. 000639441."),
        bullet("<b>Chairman</b> - Data Science Student Representative Board."),
        section("Certifications"),
        bullet("Data Analysis Fullstack Bootcamp - MySkill, 2025."),
        bullet("Data Science Fundamental - MySkill, 2025."),
        bullet("Time Series Analysis - MySkill, 2025."),
        section("Languages"),
        bullet("Indonesian - Native."),
        bullet("English - Professional Working Proficiency."),
    ]
    return story


def generate():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=LEFT,
        rightMargin=RIGHT,
        topMargin=TOP,
        bottomMargin=BOTTOM,
        title="Muhammad Ali Akbar Al-Qahri - Data Intelligence Resume",
        author="Muhammad Ali Akbar Al-Qahri",
        subject="ATS Data Intelligence resume",
        pageCompression=1,
    )
    frame = Frame(
        LEFT,
        BOTTOM,
        CONTENT_W,
        PAGE_H - TOP - BOTTOM,
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
        id="resume-frame",
    )
    doc.addPageTemplates(
        [PageTemplate(id="resume", frames=[frame], onPage=draw_page)]
    )
    doc.build(build_story())
    shutil.copyfile(OUTPUT_PDF, WEBSITE_PDF)
    print(f"Generated {OUTPUT_PDF}")
    print(f"Updated {WEBSITE_PDF}")


if __name__ == "__main__":
    generate()
