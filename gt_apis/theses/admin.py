from django.contrib import admin
from django.db.models import Count, FloatField, F, Sum
from django.db.models.functions import Cast, Round
from django.template.response import TemplateResponse
from django.urls import path
from django.utils.html import mark_safe
from theses.models import *
from django.forms.models import BaseInlineFormSet


class MyAdminSite(admin.AdminSite):
    site_header = 'graduate theses app'

    def get_urls(self):
        return ([path('score_stats/', self.admin_view(self.score_stats), name="score_stats"),
                path('freq_stats/', self.admin_view(self.freq_stats), name="freq_stats")] +
                super().get_urls())

    def score_stats(self, request):
        year = request.GET.get('year', None)
        years = KhoaLuanTotNghiep.objects.values_list("created_date__year", flat=True).distinct()

        average_scores = (KhoaLuanTotNghiep.objects.filter(diem_tong__isnull=False)
                          .annotate(
            average_score=Round(Sum(Cast(F('diem__diem') * F('diem__tieu_chi__ty_le') / 100, FloatField())) / Count('diem__gv', distinct=True), 2)
        ).values("id", "ten_khoa_luan", "average_score", "created_date"))

        if year:
            average_scores = average_scores.filter(created_date__year=year)
            context = {
                "average_scores": average_scores,
                "years": years,
                "request_year": int(year),
            }
        else:
            context = {
                "average_scores": average_scores,
                "years": years,
                "request_year": None,
            }

        return TemplateResponse(request, 'admin/score_stats.html', context)

    def freq_stats(self, request):
        faculty_id = request.GET.get('faculty_id', None)
        faculties = NganhHoc.objects.all()

        freq_stats = (NganhHoc.objects.annotate(
            freq=Count("lop__sinhvien__khoaluantotnghiep"),
        ).values("id", "ten_nganh", "created_date", "freq"))

        if faculty_id:
            freq_stats = freq_stats.filter(id=faculty_id)
            context = {
                "freq_stats": freq_stats,
                "request_faculty_id": int(faculty_id),
                "faculties": faculties,
            }
        else:
            context = {
                "freq_stats": freq_stats,
                "request_faculty_id": None,
                "faculties": faculties,
            }

        return TemplateResponse(request, 'admin/freq_stats.html', context)


admin_site = MyAdminSite(name='graduateTheses')

admin_site.register(Lop)
admin_site.register(NganhHoc)
admin_site.register(NguoiDung, name="Người Dùng")
admin_site.register(SinhVien, name="Sinh Viên")
admin_site.register(GiangVien, name="Giảng Viên")
admin_site.register(GiaoVu, name="Giáo Vụ")
admin_site.register(KLTNGVHuongDan)
admin_site.register(HoiDongBVKL)
admin.site.register(ActionLog)


# admin.site.register(Diem)  # Consider if special customization is needed


class DiemInlineFormset(BaseInlineFormSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.queryset = Diem.objects.filter(kltn=self.instance)
            allowed_tieu_chi = self.instance.tieu_chi.all()
            for form in self.forms:
                if 'tieu_chi' in form.fields:
                    form.fields['tieu_chi'].queryset = allowed_tieu_chi
        else:
            self.queryset = Diem.objects.none()


class DiemInline(admin.TabularInline):
    model = Diem
    formset = DiemInlineFormset
    extra = 1


class KhoaLuanTotNghiepAdmin(admin.ModelAdmin):
    # list_display = ['ten_khoa_luan', 'mssv', 'diem_tong']
    search_fields = ['ten_khoa_luan', 'mssv__ten']
    list_filter = ['mssv', 'diem_tong']
    inlines = [DiemInline]
    # filter_horizontal = ('tieu_chis',)


class TieuChiAdmin(admin.ModelAdmin):
    list_display = ['tieu_chi', 'ty_le']
    filter_horizontal = ['kltn']


# Ensure KhoaLuanTotNghiep is registered only once with the correct admin configuration
admin_site.register(KhoaLuanTotNghiep, KhoaLuanTotNghiepAdmin)
admin_site.register(TieuChi, TieuChiAdmin)
