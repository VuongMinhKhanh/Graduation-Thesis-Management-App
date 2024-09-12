from django.core.mail import send_mail
from django.conf import settings

def send_mail_for_thesis(data):
    thesis_name = data["ten_khoa_luan"]
    score = data["diem_tong"]
    plagiarism = data["ty_le_dao_van"]

    if score is None:
        score = 0

    for sv in data["mssv"]:
        full_name = sv["first_name"] + " " + sv["last_name"]
        subject = f"Notification of Thesis Evaluation Result - {full_name}"
        message = (f"Subject: Notification of Thesis Evaluation Result - {full_name}\n\n"
                   f"Dear {full_name},\n\n"
                   f"I hope this message finds you well. We are writing to inform you of the evaluation results for your graduate thesis titled \"{thesis_name}\" which you submitted as part of the requirements for your [Degree Program, e.g., Master's or PhD] at [University/College Name].\n\n"
                   f"After a thorough review by the designated committee, we are pleased to present the details of your assessment:\n\n"
                   f"Title of Thesis: {thesis_name}\n"
                   f"Student ID: {sv['mssv']}\n"
                   f"Total Score: {score}/10\n"
                   f"Percentage of plagiarism: {plagiarism}%\n"
                   f"[Optional: Include a brief comment about the thesis quality, strengths, or areas for improvement.]\n\n"
                   f"We would like to congratulate you on the hard work and dedication you have demonstrated throughout your research and writing process. The score reflects the quality and integrity of your scholarly work.\n\n"
                   f"Please note that official documentation regarding your thesis evaluation and any subsequent graduation procedures will be provided by the [University's Office of Academic Affairs/Graduate Studies Office].\n\n"
                   f"Should you have any questions or require further clarification, do not hesitate to contact us at [Contact Information] or during office hours.\n\n"
                   f"Once again, congratulations on reaching this significant milestone in your academic journey. We wish you the best in your future endeavors.\n\n"
                   f"Warm regards,\n\n"
                   f"[Your Full Name]\n"
                   f"[Your Position/Title]\n"
                   f"[Department Name]\n"
                   f"[University/College Name]\n"
                   f"[Contact Information]")

        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [sv["email"]]
        )