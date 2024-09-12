from theses.models import GiangVien,HoiDongBVKL,Diem
from django.db.models import Avg
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from datetime import datetime, timedelta
from django.utils import timezone
# Kiểm tra giảng viên có nằm trong HDBVKhoaLuan của một Khóa luận tốt nghiệp không
def check_giang_vien_in_hdbv_kltn(giangvien, kltn):
    hdbvkl = kltn.hdbvkl
    giang_vien_list = set([hdbvkl.gv_phan_bien, hdbvkl.chu_tich, hdbvkl.thu_ky])
    giang_vien_list.update(hdbvkl.thanh_vien.all())
    return giangvien in giang_vien_list

# Kiểm tra tiêu chí có nằm trong Khóa luận tốt nghiệp không
def check_tieu_chi_in_kltn(tieuchi, kltn):
    return tieuchi in kltn.tieu_chi.all()
#Tính tiểm tổng
def calculate_diem_tong(kltn):
    tieu_chis = kltn.tieu_chi.all()
    total_diem = 0
    for tc in tieu_chis:
        diems = Diem.objects.filter(kltn=kltn, tieu_chi=tc)
        if diems.exists():
            avg_diem = diems.aggregate(Avg('diem'))['diem__avg']
            total_diem += avg_diem * tc.ty_le/100
    return total_diem
#gửi mail
def send_custom_email(message, recipient_email):
    subject = 'Subject of the Email'
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [recipient_email]
    send_mail(subject, message, email_from, recipient_list)
#tạo mã xác nhận ngẫu nhiên
def generate_verification_code():
    characters = string.ascii_letters + string.digits  # Tất cả chữ cái và chữ số
    code = ''.join(random.choice(characters) for _ in range(5))  # Tạo chuỗi ngẫu nhiên gồm 5 ký tự
    return code
#So sánh thời gian xác thực email
def is_updated_date_within_minutes(updated_date, minutes):
    now = timezone.now()
    if updated_date.tzinfo is None:
        updated_date = timezone.make_aware(updated_date, timezone.get_default_timezone())

    available_time = updated_date + timedelta(minutes=minutes)

    return updated_date < now < available_time
