from django.db.models import Q
from rest_framework import permissions
from theses.models import GiangVien, GiaoVu, SinhVien, KhoaLuanTotNghiep


class KLTNPermissionUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return (super().has_permission(request, view) and
                (request.user.groups.all().values_list('name', flat=True)
                .filter(name="giáo vụ").exists() or request.user.is_superuser))
        # return False

class GiangVienPermissionUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        is_giao_vu = GiaoVuPermissionUser().has_permission(request, view)
        return (super().has_permission(request, view) and
                (GiangVien.objects.filter(id=request.user.id).exists() or is_giao_vu or request.user.is_superuser))


class GiaoVuPermissionUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return (super().has_permission(request, view) and
                (GiaoVu.objects.filter(id=request.user.id).exists() or request.user.is_superuser))


class SinhVienPermissionUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        # print("sinh vien", request.user, SinhVien.objects.filter(id=request.user.id).exists())
        authorized = False
        if SinhVien.objects.filter(id=request.user.id).exists():
            thesis_id = view.kwargs.get('pk')
            # Check if the user is a "sinh_vien" and has a KLTN object
            try:
                sv = KhoaLuanTotNghiep.objects.filter(mssv__id=request.user.id, id=thesis_id).first()
                authorized = sv is not None
            except:
                authorized = False
        else:
            authorized = False # For non-"sinh_vien" users, keep the original permission logic

        # Check if the user is a "giang_vien" or "giao_vu"
        is_giang_vien = GiangVienPermissionUser().has_permission(request, view)
        is_giao_vu = GiaoVuPermissionUser().has_permission(request, view)
        print("super only", super().has_permission(request, view))
        return (super().has_permission(request, view) and
                (authorized or is_giang_vien or is_giao_vu or request.user.is_superuser))