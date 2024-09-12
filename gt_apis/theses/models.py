from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
from enum import Enum
# Create your models here.


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True


class TrangThai(BaseModel):
    trang_thai = models.BooleanField(default=True)

    class Meta:
        abstract = True


class NguoiDung(AbstractUser):
    avatar = models.ImageField(upload_to='graduatethesis/%Y/%m', null=True, blank=True)
    # Kế thừa từ BaseModel và kết nối với AbstractUser để lưu thông tin người dùng
    # Thêm các trường thông tin người dùng khác nếu cần


class GiaoVu(NguoiDung):
    trinh_do = models.CharField(max_length=100)
    class Meta:
        #đặt lại tên hiển thị ra trang admin
        verbose_name_plural = ('Giáo Vụ')
    def __str__(self):
        return self.first_name+self.last_name


class GiangVien(NguoiDung):
    class Meta:
        verbose_name = "Giảng Viên"
        verbose_name_plural = verbose_name

    bang_cap = models.CharField(max_length=100)
    kinh_nghiem = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.pk}-{self.username}"


class SinhVien(NguoiDung):
    class Meta:
        verbose_name = "Sinh Viên"
        verbose_name_plural = verbose_name
    mssv = models.CharField(max_length=20, unique=True)
    nam_nhap_hoc = models.IntegerField()
    lop = models.ForeignKey('Lop', on_delete=models.PROTECT, null=False)

    def __str__(self):
        return self.first_name + " " + self.last_name


class Lop(TrangThai):
    ten_lop = models.CharField(max_length=100)
    si_so = models.IntegerField()
    nganh = models.ForeignKey("NganhHoc", on_delete=models.PROTECT, default=1)

    def __str__(self):
        return self.ten_lop


class NganhHoc(TrangThai):
    # Thông tin về ngành học
    ten_nganh = models.CharField(max_length=100)
    # so_tin_chi = models.IntegerField()

    def __str__(self):
        return self.ten_nganh

#
# class LopHocNganhHoc(BaseModel):
#     lop = models.ForeignKey(Lop, on_delete=models.CASCADE)
#     nganh_hoc = models.ForeignKey(NganhHoc, on_delete=models.CASCADE)


class KhoaLuanTotNghiep(TrangThai):
    ten_khoa_luan = models.CharField(max_length=200)
    ty_le_dao_van = models.FloatField()
    diem_tong = models.FloatField(null=True, blank=True)
    mssv = models.ManyToManyField(SinhVien)
    hdbvkl = models.ForeignKey("HoiDongBVKL",on_delete=models.PROTECT, null=True)
    # tieu_chis = models.ManyToManyField("TieuChi", related_name='kltns')

    def __str__(self):
        return self.ten_khoa_luan


class KLTNGVHuongDan(BaseModel):
    kltn = models.ForeignKey(KhoaLuanTotNghiep, on_delete=models.CASCADE)
    gv_huong_dan = models.ManyToManyField(GiangVien, blank=True)

    def __str__(self):
        return f"{self.pk} {self.kltn}"

class TieuChi(BaseModel):
    tieu_chi = models.CharField(max_length=200)
    ty_le = models.FloatField()
    kltn = models.ManyToManyField(KhoaLuanTotNghiep, blank=True, related_name="tieu_chi")

    def __str__(self):
        return f"{self.tieu_chi} + {self.ty_le}"


class HoiDongBVKL(TrangThai):
    # Thông tin về Hội đồng bảo vệ khóa luận
    gv_phan_bien = models.ForeignKey(GiangVien,related_name="gv_phan_bien", on_delete=models.CASCADE)
    chu_tich = models.ForeignKey(GiangVien, related_name="chu_tich",on_delete=models.CASCADE)
    thu_ky = models.ForeignKey(GiangVien, related_name="thu_ky",on_delete=models.CASCADE)
    thanh_vien = models.ManyToManyField(GiangVien,blank=True)
    ngay_bao_ve = models.DateField()


class Diem(BaseModel):
    # Điểm của từng tiêu chí của khóa luận
    tieu_chi = models.ForeignKey(TieuChi, on_delete=models.CASCADE, default=1)
    diem = models.FloatField()
    gv = models.ForeignKey(GiangVien, on_delete=models.CASCADE)
    kltn = models.ForeignKey(KhoaLuanTotNghiep, on_delete=models.CASCADE)

    class Meta:
        unique_together=('tieu_chi','gv','kltn')


class ActionLog(models.Model):
    user = models.ForeignKey(NguoiDung, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.action} - {self.timestamp}'

class EmailConfirm(BaseModel):
    ma_xac_nhan = models.CharField(max_length=5, null=False)
    nguoidung = models.OneToOneField(NguoiDung, on_delete=models.CASCADE)
    trang_thai = models.BooleanField(default=False)
